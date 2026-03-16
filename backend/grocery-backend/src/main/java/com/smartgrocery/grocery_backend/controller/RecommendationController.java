package com.smartgrocery.grocery_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.service.RecommendationService;

@RestController
@RequestMapping("/recommend")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/recipe")
    public List<String> getRecipeRecommendation(@RequestParam String recipe) {
        return recommendationService.getRecipeItems(recipe);
    }
    
    @GetMapping("/diet")
public List<String> getDietRecommendation(@RequestParam String diet) {
    return recommendationService.getDietRecommendation(diet);
}

@GetMapping("/budget")
public List<String> getBudgetRecommendation(@RequestParam int budget) {
    return recommendationService.getBudgetRecommendation(budget);
}

@GetMapping("/health")
public List<String> getHealthRecommendation(@RequestParam String condition) {
    return recommendationService.getHealthRecommendation(condition);
}

@GetMapping("/purchase")
public List<String> getPurchaseRecommendation(@RequestParam String product) {
    return recommendationService.getPurchaseRecommendation(product);
}

@GetMapping("/products")
public List<Product> getRecommendedProducts(@RequestParam String keyword) {
    return recommendationService.getRecommendedProducts(keyword);
}

@GetMapping("/cart")
public List<String> getCartSuggestions(@RequestParam String product) {
    return recommendationService.getCartSuggestions(product);
}

}