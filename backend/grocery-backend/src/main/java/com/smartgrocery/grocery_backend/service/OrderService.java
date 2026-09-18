package com.smartgrocery.grocery_backend.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartgrocery.grocery_backend.dto.OrderItemRequest;
import com.smartgrocery.grocery_backend.dto.OrderItemResponse;
import com.smartgrocery.grocery_backend.dto.OrderRequest;
import com.smartgrocery.grocery_backend.dto.OrderResponse;
import com.smartgrocery.grocery_backend.model.CustomerLocation;
import com.smartgrocery.grocery_backend.model.DeliverySettings;
import com.smartgrocery.grocery_backend.model.Order;
import com.smartgrocery.grocery_backend.model.OrderItem;
import com.smartgrocery.grocery_backend.model.OrderStatus;
import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.repository.CustomerLocationRepository;
import com.smartgrocery.grocery_backend.repository.OrderRepository;
import com.smartgrocery.grocery_backend.repository.ProductRepository;
import com.smartgrocery.grocery_backend.repository.UserRepository;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomerLocationRepository locationRepository;
    private final DeliverySettingsService deliverySettingsService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository, CustomerLocationRepository locationRepository, DeliverySettingsService deliverySettingsService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.deliverySettingsService = deliverySettingsService;
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
        if (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        Order order = new Order();
        order.setName(request.getName());
        order.setPhone(request.getPhone());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(request.getPaymentStatus());
        order.setRazorpayOrderId(request.getRazorpayOrderId());
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);

        // Process Mandatory Delivery Location Snapshot
        processDeliveryLocation(request, userId, order);

        double subtotal = 0;
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

            subtotal += product.getPrice() * itemRequest.getQuantity();
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

        // Authoritative Database Delivery Fee Calculation
        DeliverySettings settings = deliverySettingsService.getDeliverySettings();
        double deliveryFee = (subtotal >= settings.getFreeDeliveryMinimum()) ? 0.0 : settings.getDeliveryFee();
        double finalTotalPrice = Math.max(0.0, subtotal + deliveryFee);

        order.setDeliveryFee(deliveryFee);
        order.setTotalPrice(finalTotalPrice);
        order.setQuantity(finalQuantity);
        order.setItems(items);

        Order savedOrder = orderRepository.save(order);
        log.info("Order saved successfully with orderId={} for userId={}", savedOrder.getId(), userId);
        return toResponse(savedOrder);
    }

    private void processDeliveryLocation(OrderRequest request, Long userId, Order order) {
        String finalAddress;
        String finalLandmark;
        Double finalLat;
        Double finalLng;
        String finalLabel;

        if (request.getDeliveryLocationId() != null) {
            // Case 1: Customer selected a saved location
            CustomerLocation savedLocation = locationRepository.findByIdAndUserIdAndActiveTrue(request.getDeliveryLocationId(), userId)
                    .orElseThrow(() -> new AccessDeniedException("Selected saved delivery location is invalid or does not belong to you"));

            finalAddress = savedLocation.getAddress();
            finalLandmark = savedLocation.getLandmark();
            finalLat = savedLocation.getLatitude();
            finalLng = savedLocation.getLongitude();
            finalLabel = savedLocation.getLabel();
        } else if (request.getDeliveryLatitude() != null && request.getDeliveryLongitude() != null) {
            // Case 2: Customer provided coordinates (GPS / Custom Map pin)
            finalLat = request.getDeliveryLatitude();
            finalLng = request.getDeliveryLongitude();

            if (finalLat < -90.0 || finalLat > 90.0 || finalLng < -180.0 || finalLng > 180.0) {
                throw new IllegalArgumentException("Valid delivery latitude (-90..90) and longitude (-180..180) are required");
            }

            finalAddress = request.getDeliveryAddress() != null && !request.getDeliveryAddress().isBlank()
                    ? request.getDeliveryAddress().trim()
                    : request.getAddress();

            if (finalAddress == null || finalAddress.isBlank()) {
                throw new IllegalArgumentException("Delivery address is required");
            }

            finalLandmark = request.getDeliveryLandmark() != null ? request.getDeliveryLandmark().trim() : "";
            finalLabel = request.getDeliveryLocationLabel() != null && !request.getDeliveryLocationLabel().isBlank()
                    ? request.getDeliveryLocationLabel().trim()
                    : "Delivery Location";

            // Optional: Save as reusable customer location if requested
            if (Boolean.TRUE.equals(request.getSaveLocation())) {
                CustomerLocation newLocation = new CustomerLocation(userId, finalLabel, finalAddress, finalLandmark, finalLat, finalLng);
                locationRepository.save(newLocation);
            }
        } else if (request.getAddress() != null && !request.getAddress().isBlank()) {
            // Fallback for legacy calls without explicit coordinates
            finalAddress = request.getAddress().trim();
            finalLandmark = request.getDeliveryLandmark() != null ? request.getDeliveryLandmark() : "";
            finalLat = 17.38504; // Default city fallback (Hyderabad) for legacy orders
            finalLng = 78.48667;
            finalLabel = "Delivery Address";
        } else {
            throw new IllegalArgumentException("Please select or confirm a valid delivery location before placing your order");
        }

        // Write IMMUTABLE Snapshot into Order record
        order.setDeliveryAddress(finalAddress);
        order.setDeliveryLandmark(finalLandmark);
        order.setDeliveryLatitude(finalLat);
        order.setDeliveryLongitude(finalLng);
        order.setDeliveryLocationLabel(finalLabel);
        // Also populate legacy address field for backwards compatibility
        order.setAddress(finalAddress);
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
        response.setAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : order.getAddress());

        // Delivery Location Snapshot
        response.setDeliveryAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : order.getAddress());
        response.setDeliveryLandmark(order.getDeliveryLandmark());
        response.setDeliveryLatitude(order.getDeliveryLatitude() != null ? order.getDeliveryLatitude() : 17.38504);
        response.setDeliveryLongitude(order.getDeliveryLongitude() != null ? order.getDeliveryLongitude() : 78.48667);
        response.setDeliveryLocationLabel(order.getDeliveryLocationLabel() != null ? order.getDeliveryLocationLabel() : "Delivery Location");

        response.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponse> items = mapItems(order);
        response.setProducts(items);
        double itemsSubtotal = items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        double orderDeliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0;
        response.setDeliveryFee(orderDeliveryFee);
        response.setTotalAmount(order.getTotalPrice() > 0 ? order.getTotalPrice() : (itemsSubtotal + orderDeliveryFee));
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
