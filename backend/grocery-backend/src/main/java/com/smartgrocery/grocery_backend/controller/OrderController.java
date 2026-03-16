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
import com.smartgrocery.grocery_backend.repository.OrderRepository;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // CREATE ORDER
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderRepository.save(order);
    }

    // GET ALL ORDERS
    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    // UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {

        Order order = orderRepository.findById(id).orElseThrow();

        order.setStatus(status);

        return orderRepository.save(order);
    }
}