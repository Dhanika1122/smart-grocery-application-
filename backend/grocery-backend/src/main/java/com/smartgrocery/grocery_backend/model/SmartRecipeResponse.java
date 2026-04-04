package com.smartgrocery.grocery_backend.model;

import java.util.ArrayList;
import java.util.List;

public class SmartRecipeResponse {
    private String recipeName;
    private int members;
    private String imageUrl;

    private List<GroceryItem> grocery = new ArrayList<>();
    private List<String> steps = new ArrayList<>();

    // mapped products
    private List<Product> products = new ArrayList<>();

    public String getRecipeName() {
        return recipeName;
    }

    public void setRecipeName(String recipeName) {
        this.recipeName = recipeName;
    }

    public int getMembers() {
        return members;
    }

    public void setMembers(int members) {
        this.members = members;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<GroceryItem> getGrocery() {
        return grocery;
    }

    public void setGrocery(List<GroceryItem> grocery) {
        this.grocery = grocery == null ? new ArrayList<>() : grocery;
    }

    public List<String> getSteps() {
        return steps;
    }

    public void setSteps(List<String> steps) {
        this.steps = steps == null ? new ArrayList<>() : steps;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products == null ? new ArrayList<>() : products;
    }
}

