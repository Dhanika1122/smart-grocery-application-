package com.smartgrocery.grocery_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.DeliverySettings;
import com.smartgrocery.grocery_backend.service.DeliverySettingsService;

@RestController
@RequestMapping("/api/delivery-settings")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicDeliverySettingsController {

    private final DeliverySettingsService service;

    public PublicDeliverySettingsController(DeliverySettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<DeliverySettings> getDeliverySettings() {
        return ResponseEntity.ok(service.getDeliverySettings());
    }
}
