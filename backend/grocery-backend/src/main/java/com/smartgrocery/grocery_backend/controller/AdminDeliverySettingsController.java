package com.smartgrocery.grocery_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.DeliverySettings;
import com.smartgrocery.grocery_backend.service.DeliverySettingsService;

@RestController
@RequestMapping("/api/admin/delivery-settings")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminDeliverySettingsController {

    private final DeliverySettingsService service;

    public AdminDeliverySettingsController(DeliverySettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<DeliverySettings> getDeliverySettings() {
        return ResponseEntity.ok(service.getDeliverySettings());
    }

    @PutMapping
    public ResponseEntity<?> updateDeliverySettings(@RequestBody Map<String, Object> body) {
        try {
            Object feeObj = body.get("deliveryFee");
            Object minObj = body.get("freeDeliveryMinimum");

            if (feeObj == null || minObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "deliveryFee and freeDeliveryMinimum are required"));
            }

            Double deliveryFee = Double.parseDouble(feeObj.toString());
            Double freeDeliveryMinimum = Double.parseDouble(minObj.toString());

            DeliverySettings updated = service.updateDeliverySettings(deliveryFee, freeDeliveryMinimum);
            return ResponseEntity.ok(updated);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid numeric format for delivery settings"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
