package com.smartgrocery.grocery_backend.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartgrocery.grocery_backend.dto.OrderItemRequest;
import com.smartgrocery.grocery_backend.dto.OrderItemResponse;
import com.smartgrocery.grocery_backend.dto.OrderRequest;
import com.smartgrocery.grocery_backend.dto.OrderResponse;
import com.smartgrocery.grocery_backend.model.Order;
import com.smartgrocery.grocery_backend.model.OrderItem;
import com.smartgrocery.grocery_backend.model.OrderStatus;
import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.repository.OrderRepository;
import com.smartgrocery.grocery_backend.repository.ProductRepository;
import com.smartgrocery.grocery_backend.repository.UserRepository;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        log.info("Creating order for userId={} with request={}", userId, request);

        if (userId == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }
        if (request == null) {
            throw new IllegalArgumentException("Order request is required");
        }

        List<OrderItemRequest> requestedItems = request.getItems();
        if (requestedItems == null || requestedItems.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }
        if (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        Order order = new Order();
        order.setName(request.getName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(request.getPaymentStatus());
        order.setRazorpayOrderId(request.getRazorpayOrderId());
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);

        double totalAmount = 0;
        int totalQuantity = 0;
        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest itemRequest : requestedItems) {
            if (itemRequest.getProductId() == null || itemRequest.getQuantity() <= 0) {
                throw new IllegalArgumentException("Each order item must have a productId and quantity");
            }

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemRequest.getProductId()));
            if (product.getPrice() <= 0) {
                throw new IllegalArgumentException("Invalid product price for product: " + itemRequest.getProductId());
            }

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(product.getPrice());
            items.add(item);

            totalAmount += product.getPrice() * itemRequest.getQuantity();
            totalQuantity += itemRequest.getQuantity();
        }

        Integer requestedQuantity = request.getQuantity();
        if (requestedQuantity != null && requestedQuantity <= 0) {
            throw new IllegalArgumentException("Quantity is missing");
        }

        int finalQuantity = requestedQuantity != null ? requestedQuantity : totalQuantity;
        if (finalQuantity <= 0) {
            throw new IllegalArgumentException("Quantity is missing");
        }

        order.setTotalPrice(totalAmount);
        order.setQuantity(finalQuantity);
        order.setItems(items);

        Order savedOrder = orderRepository.save(order);
        log.info("Order saved successfully with orderId={} for userId={}", savedOrder.getId(), userId);
        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> toResponses(List<Order> orders) {
        return orders.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getId());
        response.setUserId(order.getUserId());
        response.setCustomerEmail(order.getUserId() != null
                ? userRepository.findById(order.getUserId()).map(user -> user.getEmail()).orElse("")
                : "");
        response.setStatus(order.getStatus() != null ? order.getStatus().name() : OrderStatus.PENDING.name());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setRazorpayOrderId(order.getRazorpayOrderId());
        response.setRazorpayPaymentId(order.getRazorpayPaymentId());
        response.setName(order.getName());
        response.setPhone(order.getPhone());
        response.setAddress(order.getAddress());
        response.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponse> items = mapItems(order);
        response.setProducts(items);
        response.setTotalAmount(items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum());
        return response;
    }

    public OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            log.warn("Received blank order status. Falling back to PENDING.");
            return OrderStatus.PENDING;
        }

        try {
            return OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            log.warn("Received invalid order status '{}'. Falling back to PENDING.", status);
            return OrderStatus.PENDING;
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return toResponses(orderRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(Long userId) {
        return toResponses(orderRepository.findAllByUserId(userId));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        order.setStatus(parseStatus(status));
        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    public boolean orderBelongsToAdmin(Order order, Long adminId) {
        if (adminId == null) {
            return false;
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null && product.getAdmin() != null && adminId.equals(product.getAdmin().getId())) {
                return true;
            }
        }

        if (order.getProductId() != null) {
            return productRepository.findById(order.getProductId())
                    .map(product -> product.getAdmin() != null && adminId.equals(product.getAdmin().getId()))
                    .orElse(false);
        }

        return false;
    }

    private List<OrderItemResponse> mapItems(Order order) {
        List<OrderItemResponse> responses = new ArrayList<>();

        if (order == null) {
            return responses;
        }

        for (OrderItem item : order.getItems()) {
            if (item == null) {
                continue;
            }
            Product product = item.getProduct();
            if (product == null) {
                log.warn("Skipping order item without product for orderId={}", order.getId());
                continue;
            }
            OrderItemResponse response = new OrderItemResponse();
            response.setProductId(product.getId());
            response.setName(product.getName());
            response.setImage(product.getImage());
            response.setPrice(item.getPrice());
            response.setQuantity(item.getQuantity());
            responses.add(response);
        }

        if (!responses.isEmpty()) {
            return responses;
        }

        if (order.getProductId() == null) {
            return List.of();
        }

        return productRepository.findById(order.getProductId())
                .map(product -> {
                    OrderItemResponse legacy = new OrderItemResponse();
                    legacy.setProductId(product.getId());
                    legacy.setName(product.getName());
                    legacy.setImage(product.getImage());
                    legacy.setPrice(order.getQuantity() == null || order.getQuantity() == 0
                            ? order.getTotalPrice()
                            : order.getTotalPrice() / order.getQuantity());
                    legacy.setQuantity(order.getQuantity() == null ? 0 : order.getQuantity());
                    return List.of(legacy);
                })
                .orElse(List.of());
    }
}
