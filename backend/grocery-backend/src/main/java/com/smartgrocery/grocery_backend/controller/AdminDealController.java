package com.smartgrocery.grocery_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.dto.WeeklyDealRequest;
import com.smartgrocery.grocery_backend.dto.WeeklyDealResponse;
import com.smartgrocery.grocery_backend.service.WeeklyDealService;

@RestController
@RequestMapping("/api/admin/deals")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminDealController {

    private final WeeklyDealService dealService;

    public AdminDealController(WeeklyDealService dealService) {
        this.dealService = dealService;
    }

    @GetMapping
    public ResponseEntity<List<WeeklyDealResponse>> getAllDeals() {
        return ResponseEntity.ok(dealService.getAllDealsForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDealById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(dealService.getDealByIdForAdmin(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createDeal(@RequestBody WeeklyDealRequest request) {
        try {
            WeeklyDealResponse created = dealService.createDeal(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeal(@PathVariable Long id, @RequestBody WeeklyDealRequest request) {
        try {
            WeeklyDealResponse updated = dealService.updateDeal(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeal(@PathVariable Long id) {
        try {
            dealService.deleteDeal(id);
            return ResponseEntity.ok(Map.of("message", "Deal deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleDealStatus(@PathVariable Long id, @RequestParam(required = false) Boolean active) {
        try {
            WeeklyDealResponse updated = dealService.toggleDealStatus(id, active);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/products")
    public ResponseEntity<?> addProductsToDeal(@PathVariable Long id, @RequestBody Map<String, List<Long>> payload) {
        try {
            List<Long> productIds = payload.get("productIds");
            WeeklyDealResponse updated = dealService.addProductsToDeal(id, productIds);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/products/{productId}")
    public ResponseEntity<?> removeProductFromDeal(@PathVariable Long id, @PathVariable Long productId) {
        try {
            WeeklyDealResponse updated = dealService.removeProductFromDeal(id, productId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
