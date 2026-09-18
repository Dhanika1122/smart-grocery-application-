package com.smartgrocery.grocery_backend.dto;

public class DealProductDto {
    private Long id;
    private String name;
    private String category;
    private double originalPrice;
    private double offerPrice;
    private int stock;
    private String image;

    public DealProductDto() {}

    public DealProductDto(Long id, String name, String category, double originalPrice, double offerPrice, int stock, String image) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.originalPrice = originalPrice;
        this.offerPrice = offerPrice;
        this.stock = stock;
        this.image = image;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public double getOfferPrice() {
        return offerPrice;
    }

    public void setOfferPrice(double offerPrice) {
        this.offerPrice = offerPrice;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
