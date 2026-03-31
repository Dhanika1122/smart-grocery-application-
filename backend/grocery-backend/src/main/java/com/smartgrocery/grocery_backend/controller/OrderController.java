package com.smartgrocery.grocery_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.Order;
import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.repository.OrderRepository;
import com.smartgrocery.grocery_backend.repository.UserRepository;
import com.smartgrocery.grocery_backend.service.ProductService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    public OrderController(OrderRepository orderRepository, ProductService productService, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.userRepository = userRepository;
    }

    // CREATE ORDER
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        // Customer tenant isolation: attach authenticated user to order.
        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        if (authenticatedUserId != null) {
            order.setUserId(authenticatedUserId);
        }
        return orderRepository.save(order);
    }

    // GET ALL ORDERS
    @GetMapping
    public List<Order> getOrders() {
        Long authenticatedAdminId = productService.getAuthenticatedAdminIdOrNull();
        if (authenticatedAdminId != null) {
            List<Product> adminProducts = productService.getProductsByAdmin(authenticatedAdminId);
            List<Long> productIds = adminProducts.stream()
                    .map(Product::getId)
                    .toList();

            if (productIds.isEmpty()) {
                return List.of();
            }

            return orderRepository.findByProductIdIn(productIds);
        }

        // Customer tenant isolation
        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        if (authenticatedUserId != null) {
            return orderRepository.findByUserId(authenticatedUserId);
        }

        return List.of();
    }

    // UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {

        Order order = orderRepository.findById(id).orElseThrow();

        // Tenant isolation: ensure the order's product belongs to the authenticated admin.
        // ProductService#getProductById enforces ownership and will throw AccessDeniedException if not allowed.
        productService.getProductById(order.getProductId());

        order.setStatus(status);

        return orderRepository.save(order);
    }

    private Long getAuthenticatedUserIdOrNull() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        boolean isCustomer = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()));
        if (!isCustomer) return null;

        String email = auth.getName();
        if (email == null || email.isBlank()) return null;

        return userRepository.findByEmail(email).map(u -> u.getId()).orElseThrow();
    }
}