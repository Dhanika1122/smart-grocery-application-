package com.smartgrocery.grocery_backend.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.smartgrocery.grocery_backend.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> getKey() {
        return ResponseEntity.ok(Map.of("key", paymentService.getPublicKey()));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {

        try {
            Object amountValue = data.get("amount");

            if (amountValue == null) {
                throw new IllegalArgumentException("Amount is required");
            }

            // ✅ FIX: Convert safely
            double amount = Double.parseDouble(amountValue.toString());

            log.info("Received payment request: amount={}", amount);

            // ✅ PASS double (NOT Object)
            Order order = paymentService.createOrder(amount);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", paymentService.getPublicKey());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid request", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating Razorpay order", e);
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}