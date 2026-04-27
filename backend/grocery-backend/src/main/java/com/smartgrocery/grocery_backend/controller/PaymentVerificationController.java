package com.smartgrocery.grocery_backend.controller;

import com.razorpay.Utils;
import com.smartgrocery.grocery_backend.service.PaymentService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentVerificationController {

    private static final Logger log = LoggerFactory.getLogger(PaymentVerificationController.class);

    private final PaymentService paymentService;

    public PaymentVerificationController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String razorpayOrderId = data.get("razorpay_order_id");
            String razorpayPaymentId = data.get("razorpay_payment_id");
            String razorpaySignature = data.get("razorpay_signature");

            if (razorpayOrderId == null || razorpayOrderId.isBlank()
                    || razorpayPaymentId == null || razorpayPaymentId.isBlank()
                    || razorpaySignature == null || razorpaySignature.isBlank()) {
                throw new IllegalArgumentException("Missing Razorpay payment verification fields");
            }

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, paymentService.getSecret());
            log.info("Verified Razorpay payment. order_id={}, payment_id={}, valid={}",
                    razorpayOrderId, razorpayPaymentId, isValid);

            if (isValid) {
                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Payment verified successfully");
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(400).body(Map.of("message", "Invalid signature"));
        } catch (IllegalArgumentException e) {
            log.error("Invalid Razorpay verification request: {}", data, e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error verifying Razorpay payment", e);
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
