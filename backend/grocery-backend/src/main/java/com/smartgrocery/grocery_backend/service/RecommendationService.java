package com.smartgrocery.grocery_backend.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.model.SmartDietPlan;
import com.smartgrocery.grocery_backend.service.AIService;
import com.smartgrocery.grocery_backend.repository.ProductRepository;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;

    @Autowired
    private AIService aiService;

    public RecommendationService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Recipe Recommendation
    public List<String> getRecipeItems(String recipe) {

        Map<String, List<String>> recipeMap = new HashMap<>();

        recipeMap.put("biryani", Arrays.asList("Rice", "Chicken", "Onion", "Curd", "Spices"));
        recipeMap.put("sandwich", Arrays.asList("Bread", "Butter", "Tomato", "Cheese"));
        recipeMap.put("omelette", Arrays.asList("Eggs", "Salt", "Onion", "Oil"));

        return recipeMap.getOrDefault(recipe.toLowerCase(), Collections.emptyList());
    }

    // Diet Recommendation
    public List<String> getDietRecommendation(String diet) {

        Map<String, List<String>> dietMap = new HashMap<>();

        dietMap.put("weight_loss", Arrays.asList(
                "Oats", "Brown Rice", "Fruits", "Vegetables", "Almonds"
        ));

        dietMap.put("muscle_gain", Arrays.asList(
                "Eggs", "Chicken", "Milk", "Peanut Butter", "Banana"
        ));

        dietMap.put("balanced_diet", Arrays.asList(
                "Rice", "Dal", "Vegetables", "Milk", "Fruits"
        ));

        return dietMap.getOrDefault(diet.toLowerCase(), Collections.emptyList());
    }

    // Budget Recommendation
    public List<String> getBudgetRecommendation(int budget) {

        if (budget <= 500) {
            return Arrays.asList("Rice", "Dal", "Eggs", "Vegetables", "Milk");
        }

        else if (budget <= 1000) {
            return Arrays.asList("Rice", "Chicken", "Milk", "Fruits", "Vegetables", "Eggs");
        }

        else {
            return Arrays.asList("Basmati Rice", "Chicken", "Fish", "Dry Fruits", "Milk", "Fruits", "Vegetables");
        }
    }

    // Health Recommendation
    public List<String> getHealthRecommendation(String condition) {

        Map<String, List<String>> healthMap = new HashMap<>();

        healthMap.put("diabetes", Arrays.asList(
                "Oats", "Brown Rice", "Vegetables", "Almonds", "Sugar Free Products"
        ));

        healthMap.put("high_bp", Arrays.asList(
                "Oats", "Banana", "Leafy Vegetables", "Low Salt Foods", "Fruits"
        ));

        healthMap.put("weight_gain", Arrays.asList(
                "Milk", "Peanut Butter", "Eggs", "Banana", "Rice"
        ));

        return healthMap.getOrDefault(condition.toLowerCase(), Collections.emptyList());
    }

    // Purchase Recommendation
    public List<String> getPurchaseRecommendation(String product) {

        Map<String, List<String>> purchaseMap = new HashMap<>();

        purchaseMap.put("milk", Arrays.asList("Bread", "Butter", "Cornflakes"));
        purchaseMap.put("bread", Arrays.asList("Butter", "Jam", "Eggs"));
        purchaseMap.put("rice", Arrays.asList("Dal", "Chicken", "Spices"));
        purchaseMap.put("chicken", Arrays.asList("Spices", "Curd", "Onion"));

        return purchaseMap.getOrDefault(product.toLowerCase(), Collections.emptyList());
    }

    // Smart Product Recommendation (connects AI with database)
    public List<Product> getRecommendedProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<String> getCartSuggestions(String product) {

    if(product.equalsIgnoreCase("milk")){
        return List.of("Bread","Butter","Cereal","Biscuits");
    }

    if(product.equalsIgnoreCase("bread")){
        return List.of("Butter","Jam","Cheese");
    }

    if(product.equalsIgnoreCase("egg")){
        return List.of("Bread","Pepper","Cheese");
    }

    return List.of("Fruits","Vegetables");
}

    // AI-backed smart diet plan (STRICT JSON -> structured response)
    public SmartDietPlan getSmartDietPlan(String input) {
        // Safety: never throw to avoid breaking existing flows; return fallback JSON on AI failure.
        try {
            return aiService.generateSmartDietPlan(input);
        } catch (Exception e) {
            // Fallback to an empty structured object.
            SmartDietPlan plan = new SmartDietPlan();
            plan.setBreakfast(List.of());
            plan.setLunch(List.of());
            plan.setDinner(List.of());
            plan.setGrocery(List.of());
            plan.setWeeklyPlan(List.of());
            plan.setWaterIntake("—");
            plan.setDoctorTips(List.of());
            return plan;
        }
    }

}