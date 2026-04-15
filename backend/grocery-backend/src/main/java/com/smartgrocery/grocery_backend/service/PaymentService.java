package com.smartgrocery.grocery_backend.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key}")
    private String key;

    @Value("${razorpay.secret}")
    private String secret;

    public String getPublicKey() {
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("Razorpay key is not configured");
        }
        log.info("Using Razorpay public key: {}", key);
        return key;
    }

    public String getSecret() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Razorpay secret is not configured");
        }
        return secret;
    }

    // ✅ FIXED: use double directly (NOT Object)
    public Order createOrder(double amount) {

        try {
            if (amount <= 0) {
                throw new IllegalArgumentException("Amount must be greater than 0");
            }

            int amountInPaise = (int) Math.round(amount * 100);

            log.info("Creating Razorpay order for amount={} (paise={})",
                    amount, amountInPaise);

            RazorpayClient razorpay = new RazorpayClient(getPublicKey(), getSecret());

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(options);

            log.info("Created Razorpay order: {}", order.toString());

            return order;

        } catch (Exception e) {
            log.error("Razorpay order creation failed", e);
            throw new IllegalStateException("Unable to create Razorpay order: " + e.getMessage());
        }
    }
}