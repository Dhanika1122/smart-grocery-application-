package com.smartgrocery.grocery_backend.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Generic AI structured response wrapper:
 * {
 *   "meals": {...},
 *   "items": [{"name":"Rice","qty":"1kg"}],
 *   "products": [...],
 *   "totalPrice": 0,
 *   "unavailableItems": ["..."],
 *   "fallbackProducts": [...]
 * }
 */
public class AIStructuredResponse {
    private SmartDietPlan meals;
    private List<GroceryItem> items = new ArrayList<>();
    private List<Product> products = new ArrayList<>();
    private double totalPrice;
    private List<String> unavailableItems = new ArrayList<>();
    private List<Product> fallbackProducts = new ArrayList<>();

    private List<String> weeklyPlan = new ArrayList<>();
    private String waterIntake;
    private List<String> doctorTips = new ArrayList<>();

    public SmartDietPlan getMeals() {
        return meals;
    }

    public void setMeals(SmartDietPlan meals) {
        this.meals = meals;
    }

    public List<GroceryItem> getItems() {
        return items;
    }

    public void setItems(List<GroceryItem> items) {
        this.items = items == null ? new ArrayList<>() : items;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products == null ? new ArrayList<>() : products;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<String> getUnavailableItems() {
        return unavailableItems;
    }

    public void setUnavailableItems(List<String> unavailableItems) {
        this.unavailableItems = unavailableItems == null ? new ArrayList<>() : unavailableItems;
    }

    public List<Product> getFallbackProducts() {
        return fallbackProducts;
    }

    public void setFallbackProducts(List<Product> fallbackProducts) {
        this.fallbackProducts = fallbackProducts == null ? new ArrayList<>() : fallbackProducts;
    }

    public List<String> getWeeklyPlan() {
        return weeklyPlan;
    }

    public void setWeeklyPlan(List<String> weeklyPlan) {
        this.weeklyPlan = weeklyPlan == null ? new ArrayList<>() : weeklyPlan;
    }

    public String getWaterIntake() {
        return waterIntake;
    }

    public void setWaterIntake(String waterIntake) {
        this.waterIntake = waterIntake == null || waterIntake.isBlank() ? "—" : waterIntake;
    }

    public List<String> getDoctorTips() {
        return doctorTips;
    }

    public void setDoctorTips(List<String> doctorTips) {
        this.doctorTips = doctorTips == null ? new ArrayList<>() : doctorTips;
    }
}

