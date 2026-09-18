package com.smartgrocery.grocery_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_settings")
public class DeliverySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double deliveryFee = 40.0;
    private Double freeDeliveryMinimum = 500.0;

    private LocalDateTime updatedAt;

    public DeliverySettings() {}

    public DeliverySettings(Double deliveryFee, Double freeDeliveryMinimum) {
        this.deliveryFee = deliveryFee;
        this.freeDeliveryMinimum = freeDeliveryMinimum;
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public Double getFreeDeliveryMinimum() {
        return freeDeliveryMinimum;
    }

    public void setFreeDeliveryMinimum(Double freeDeliveryMinimum) {
        this.freeDeliveryMinimum = freeDeliveryMinimum;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
