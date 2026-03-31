package com.smartgrocery.grocery_backend.model;

import java.util.ArrayList;
import java.util.List;

public class SmartDietPlan {
    private List<String> breakfast = new ArrayList<>();
    private List<String> lunch = new ArrayList<>();
    private List<String> dinner = new ArrayList<>();
    private List<GroceryItem> grocery = new ArrayList<>();
    private List<String> weeklyPlan = new ArrayList<>();
    private String waterIntake = "—";
    private List<String> doctorTips = new ArrayList<>();

    public List<String> getBreakfast() {
        return breakfast;
    }

    public void setBreakfast(List<String> breakfast) {
        this.breakfast = breakfast == null ? new ArrayList<>() : breakfast;
    }

    public List<String> getLunch() {
        return lunch;
    }

    public void setLunch(List<String> lunch) {
        this.lunch = lunch == null ? new ArrayList<>() : lunch;
    }

    public List<String> getDinner() {
        return dinner;
    }

    public void setDinner(List<String> dinner) {
        this.dinner = dinner == null ? new ArrayList<>() : dinner;
    }

    public List<GroceryItem> getGrocery() {
        return grocery;
    }

    public void setGrocery(List<GroceryItem> grocery) {
        this.grocery = grocery == null ? new ArrayList<>() : grocery;
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

