package com.smartgrocery.grocery_backend.service;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.model.GroceryItem;
import com.smartgrocery.grocery_backend.model.SmartDietPlan;
import com.smartgrocery.grocery_backend.model.SmartDietResponse;
import com.smartgrocery.grocery_backend.model.AIStructuredResponse;
import com.smartgrocery.grocery_backend.service.AIService;
import com.smartgrocery.grocery_backend.service.ProductMappingService;
import com.smartgrocery.grocery_backend.repository.ProductRepository;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private ProductMappingService productMappingService;

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

    /**
     * Map AI grocery items (name/qty) to real Product entities.
     * - For each item.name uses {@link ProductRepository#findByNameContainingIgnoreCase(String)}.
     * - If multiple results, picks best match using name similarity + qty closeness.
     * - If no match, ignores item (null-safe, never throws).
     */
    public List<Product> mapAIItemsToProducts(List<GroceryItem> items) {
        List<Product> result = new ArrayList<>();
        if (items == null || items.isEmpty()) return result;

        for (GroceryItem item : items) {
            if (item == null) continue;

            String aiName = item.getName();
            if (aiName == null || aiName.isBlank()) continue;

            List<Product> candidates = productRepository.findByNameContainingIgnoreCase(aiName.trim());
            if (candidates == null || candidates.isEmpty()) continue;

            Product best = pickBestCandidate(aiName, item.getQty(), candidates);
            if (best != null) result.add(best);
        }

        return result;
    }

    /**
     * Calculate total price of mapped products (null-safe).
     */
    public double calculateTotalPrice(List<Product> products) {
        if (products == null || products.isEmpty()) return 0.0;

        return products.stream()
                .filter(Objects::nonNull)
                .mapToDouble(p -> {
                    try {
                        return p.getPrice();
                    } catch (Exception e) {
                        return 0.0;
                    }
                })
                .sum();
    }

    /**
     * Full flow: AI plan -> extract grocery -> map to DB products -> compute total price.
     */
    public SmartDietResponse getSmartDietWithProducts(String input) {
        SmartDietPlan plan = getSmartDietPlan(input);

        List<GroceryItem> groceryItems =
                (plan != null && plan.getGrocery() != null) ? plan.getGrocery() : Collections.emptyList();

        List<Product> products = mapAIItemsToProducts(groceryItems);
        double totalPrice = calculateTotalPrice(products);

        SmartDietResponse response = new SmartDietResponse();
        response.setMeals(plan);
        response.setProducts(products);
        response.setTotalPrice(totalPrice);

        if (plan != null) {
            response.setWeeklyPlan(plan.getWeeklyPlan());
            response.setWaterIntake(plan.getWaterIntake());
            response.setDoctorTips(plan.getDoctorTips());
        }

        return response;
    }

    /**
     * V2 production response:
     * - Uses structured JSON: { meals: ..., items: [...] }
     * - Filters/matches ONLY products existing in DB
     * - Avoids per-item DB calls (single findAll + in-memory mapping)
     * - Includes unavailableItems + fallbackProducts
     */
    public AIStructuredResponse getSmartDietStructuredV2(String input) {
        SmartDietPlan plan = getSmartDietPlan(input);
        List<GroceryItem> items = (plan != null && plan.getGrocery() != null) ? plan.getGrocery() : Collections.emptyList();

        ProductMappingService.MappingResult mapped = productMappingService.mapAIItemsToProducts(items);
        List<Product> products = mapped.getMatchedProducts();
        double totalPrice = calculateTotalPrice(products);

        AIStructuredResponse out = new AIStructuredResponse();
        out.setMeals(plan);
        out.setItems(items);
        out.setProducts(products);
        out.setTotalPrice(totalPrice);
        out.setUnavailableItems(mapped.getUnavailableItems());
        out.setFallbackProducts(mapped.getFallbackProducts());

        if (plan != null) {
            out.setWeeklyPlan(plan.getWeeklyPlan());
            out.setWaterIntake(plan.getWaterIntake());
            out.setDoctorTips(plan.getDoctorTips());
        }

        return out;
    }

    // ----------------- Helpers (new only) -----------------

    private Product pickBestCandidate(String aiName, String aiQty, List<Product> candidates) {
        if (candidates == null || candidates.isEmpty()) return null;
        if (candidates.size() == 1) return candidates.get(0);

        String targetName = normalizeName(aiName);
        Double qtyValue = parseQtyToDouble(aiQty);

        return candidates.stream()
                .filter(Objects::nonNull)
                .min(Comparator
                        .comparingInt((Product p) -> nameScore(targetName, normalizeName(p.getName())))
                        .thenComparingInt(p -> qtyScore(qtyValue, p)))
                .orElse(null);
    }

    private String normalizeName(String s) {
        return s == null ? "" : s.trim().toLowerCase();
    }

    /**
     * Name similarity score (lower is better).
     */
    private int nameScore(String ai, String candidate) {
        if (ai.isBlank() || candidate.isBlank()) return Integer.MAX_VALUE / 2;
        if (candidate.equals(ai)) return 0;

        if (candidate.contains(ai)) {
            return 5 + Math.abs(candidate.length() - ai.length());
        }
        if (ai.contains(candidate)) {
            return 10 + Math.abs(candidate.length() - ai.length());
        }

        return 50 + Math.abs(candidate.length() - ai.length());
    }

    /**
     * Quantity closeness score (lower is better).
     * Your Product entity uses {@code stock} instead of {@code quantity}, so we compare against stock.
     */
    private int qtyScore(Double qtyValue, Product p) {
        if (qtyValue == null) return 0;
        if (p == null) return Integer.MAX_VALUE / 2;

        int stock = 0;
        try {
            stock = p.getStock();
        } catch (Exception ignored) {
            stock = 0;
        }

        double diff = Math.abs(stock - qtyValue);
        return (int) Math.round(diff * 1000);
    }

    /**
     * Extract the first number from qty like "1kg", "500 g", "2.5 L" -> 1 / 500 / 2.5
     */
    private Double parseQtyToDouble(String qty) {
        if (qty == null || qty.isBlank()) return null;
        String s = qty.trim().replace(",", "");

        Pattern pattern = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)");
        Matcher matcher = pattern.matcher(s);
        if (!matcher.find()) return null;

        try {
            return Double.parseDouble(matcher.group(1));
        } catch (Exception e) {
            return null;
        }
    }

}