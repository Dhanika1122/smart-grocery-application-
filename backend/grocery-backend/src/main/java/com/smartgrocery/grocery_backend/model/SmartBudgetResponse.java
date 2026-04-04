package com.smartgrocery.grocery_backend.model;

import java.util.ArrayList;
import java.util.List;

public class SmartBudgetResponse {
    private List<String> dayWiseMealPlan = new ArrayList<>();
    private List<GroceryItem> grocery = new ArrayList<>();
    private double totalCostPerDay;
    private String duration; // e.g. "1 week"

    // mapped products
    private List<Product> products = new ArrayList<>();

    public List<String> getDayWiseMealPlan() {
        return dayWiseMealPlan;
    }

    public void setDayWiseMealPlan(List<String> dayWiseMealPlan) {
        this.dayWiseMealPlan = dayWiseMealPlan == null ? new ArrayList<>() : dayWiseMealPlan;
    }

    public List<GroceryItem> getGrocery() {
        return grocery;
    }

    public void setGrocery(List<GroceryItem> grocery) {
        this.grocery = grocery == null ? new ArrayList<>() : grocery;
    }

    public double getTotalCostPerDay() {
        return totalCostPerDay;
    }

    public void setTotalCostPerDay(double totalCostPerDay) {
        this.totalCostPerDay = totalCostPerDay;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products == null ? new ArrayList<>() : products;
    }
}

