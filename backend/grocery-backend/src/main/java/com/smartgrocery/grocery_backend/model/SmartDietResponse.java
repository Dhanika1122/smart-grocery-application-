package com.smartgrocery.grocery_backend.model;

import java.util.ArrayList;
import java.util.List;

public class SmartDietResponse {

    // "meals" wrapper (maps to the full AI plan)
    private SmartDietPlan meals;

    // Mapped products from grocery items
    private List<Product> products = new ArrayList<>();

    private double totalPrice;

    // Convenience fields (mirrors meals fields)
    private List<String> weeklyPlan = new ArrayList<>();
    private String waterIntake;
    private List<String> doctorTips = new ArrayList<>();

    public SmartDietPlan getMeals() {
        return meals;
    }

    public void setMeals(SmartDietPlan meals) {
        this.meals = meals;
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

