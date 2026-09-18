package com.smartgrocery.grocery_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.dto.WeeklyDealResponse;
import com.smartgrocery.grocery_backend.service.WeeklyDealService;

@RestController
@RequestMapping("/api/deals")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicDealController {

    private final WeeklyDealService dealService;

    public PublicDealController(WeeklyDealService dealService) {
        this.dealService = dealService;
    }

    @GetMapping
    public ResponseEntity<List<WeeklyDealResponse>> getActiveDeals() {
        return ResponseEntity.ok(dealService.getActiveDealsForCustomer());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getActiveDealById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(dealService.getActiveDealByIdForCustomer(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}
