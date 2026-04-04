package com.smartgrocery.grocery_backend.model;

import java.util.ArrayList;
import java.util.List;

public class SmartHealthResponse {
    private String condition;
    private List<String> foodsToEat = new ArrayList<>();
    private List<String> foodsToAvoid = new ArrayList<>();
    private List<String> reasons = new ArrayList<>();
    private List<String> weeklyPlan = new ArrayList<>();

    // mapped products
    private List<Product> productsToEat = new ArrayList<>();

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public List<String> getFoodsToEat() {
        return foodsToEat;
    }

    public void setFoodsToEat(List<String> foodsToEat) {
        this.foodsToEat = foodsToEat == null ? new ArrayList<>() : foodsToEat;
    }

    public List<String> getFoodsToAvoid() {
        return foodsToAvoid;
    }

    public void setFoodsToAvoid(List<String> foodsToAvoid) {
        this.foodsToAvoid = foodsToAvoid == null ? new ArrayList<>() : foodsToAvoid;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons == null ? new ArrayList<>() : reasons;
    }

    public List<String> getWeeklyPlan() {
        return weeklyPlan;
    }

    public void setWeeklyPlan(List<String> weeklyPlan) {
        this.weeklyPlan = weeklyPlan == null ? new ArrayList<>() : weeklyPlan;
    }

    public List<Product> getProductsToEat() {
        return productsToEat;
    }

    public void setProductsToEat(List<Product> productsToEat) {
        this.productsToEat = productsToEat == null ? new ArrayList<>() : productsToEat;
    }
}

