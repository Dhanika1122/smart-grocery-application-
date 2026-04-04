package com.smartgrocery.grocery_backend.dto;

public class ProfileImageUploadResponse {

    private String imageUrl;

    public ProfileImageUploadResponse() {
    }

    public ProfileImageUploadResponse(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
