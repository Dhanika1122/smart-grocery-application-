package com.smartgrocery.grocery_backend.controller;

import com.smartgrocery.grocery_backend.dto.OrderRequest;
import com.smartgrocery.grocery_backend.dto.OrderResponse;
import com.smartgrocery.grocery_backend.dto.OrderStatusUpdateRequest;
import com.smartgrocery.grocery_backend.model.Order;
import com.smartgrocery.grocery_backend.repository.OrderRepository;
import com.smartgrocery.grocery_backend.repository.UserRepository;
import com.smartgrocery.grocery_backend.service.OrderService;
import com.smartgrocery.grocery_backend.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final UserRepository userRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderService orderService,
            ProductService productService,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            if (request == null) {
                throw new IllegalArgumentException("Order request is required");
            }
            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new IllegalArgumentException("Order must contain at least one item");
            }

            Long authenticatedUserId = getAuthenticatedUserIdOrNull();
            log.info("Incoming order request. userId={}, itemsCount={}, paymentMethod={}",
                    authenticatedUserId,
                    request != null && request.getItems() != null ? request.getItems().size() : 0,
                    request != null ? request.getPaymentMethod() : null);
            OrderResponse createdOrder = orderService.createOrder(request, authenticatedUserId);
            return ResponseEntity.ok(Map.of(
                    "message", "Order created successfully",
                    "status", createdOrder.getStatus(),
                    "orderId", createdOrder.getOrderId(),
                    "order", createdOrder
            ));
        } catch (IllegalArgumentException e) {
            log.error("Order creation validation failed for request={}", request, e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Order creation failed for request={}", request, e);
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public List<OrderResponse> getOrders() {
        Long authenticatedAdminId = productService.getAuthenticatedAdminIdOrNull();
        if (authenticatedAdminId != null) {
            log.info("Fetching orders for adminId={}", authenticatedAdminId);
            return orderService.getAllOrders();
        }

        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        if (authenticatedUserId != null) {
            log.info("Fetching orders for customer userId={}", authenticatedUserId);
            return orderService.getOrdersForUser(authenticatedUserId);
        }

        log.warn("No authenticated admin or customer found while fetching orders");
        return List.of();
    }

    @GetMapping("/api/orders")
    public List<OrderResponse> getAllOrdersForAdmin() {
        Long authenticatedAdminId = productService.getAuthenticatedAdminIdOrNull();
        if (authenticatedAdminId == null) {
            throw new org.springframework.security.access.AccessDeniedException("Admin access required");
        }

        log.info("Fetching all orders for admin dashboard. adminId={}", authenticatedAdminId);
        return orderService.getAllOrders();
    }

    @PutMapping("/api/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        try {
            String requestedStatus = request != null ? request.getStatus() : null;
            log.info("Updating order status. orderId={}, requestedStatus={}", id, requestedStatus);
            Long authenticatedAdminId = productService.getAuthenticatedAdminIdOrNull();
            if (authenticatedAdminId == null) {
                return ResponseEntity.status(403).body(Map.of("message", "You do not have access to this order"));
            }

            return ResponseEntity.ok(orderService.updateOrderStatus(id, requestedStatus));
        } catch (IllegalArgumentException e) {
            log.error("Order status update validation failed. orderId={}, request={}", id, request, e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Order status update failed. orderId={}, request={}", id, request, e);
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    private Long getAuthenticatedUserIdOrNull() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        boolean isCustomer = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()));
        if (!isCustomer) {
            return null;
        }

        String email = auth.getName();
        if (email == null || email.isBlank()) {
            return null;
        }

        Long userId = userRepository.findByEmail(email).map(u -> u.getId()).orElse(null);
        log.info("Resolved authenticated customer. email={}, userId={}", email, userId);
        return userId;
    }
}
