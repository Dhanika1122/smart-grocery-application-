package com.smartgrocery.grocery_backend.service;

import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartgrocery.grocery_backend.model.DeliverySettings;
import com.smartgrocery.grocery_backend.repository.DeliverySettingsRepository;

@Service
public class DeliverySettingsService {

    private final DeliverySettingsRepository repository;

    public DeliverySettingsService(DeliverySettingsRepository repository) {
        this.repository = repository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initDefaultSettingsIfEmpty() {
        if (repository.count() == 0) {
            DeliverySettings defaults = new DeliverySettings(40.0, 500.0);
            repository.save(defaults);
        }
    }

    @Transactional(readOnly = true)
    public DeliverySettings getDeliverySettings() {
        List<DeliverySettings> list = repository.findAll();
        if (list.isEmpty()) {
            DeliverySettings defaults = new DeliverySettings(40.0, 500.0);
            return repository.save(defaults);
        }
        return list.get(0);
    }

    @Transactional
    public DeliverySettings updateDeliverySettings(Double deliveryFee, Double freeDeliveryMinimum) {
        if (deliveryFee == null || deliveryFee < 0) {
            throw new IllegalArgumentException("Delivery Fee must be a non-negative number");
        }
        if (freeDeliveryMinimum == null || freeDeliveryMinimum < 0) {
            throw new IllegalArgumentException("Free Delivery Minimum must be a non-negative number");
        }

        DeliverySettings settings = getDeliverySettings();
        settings.setDeliveryFee(deliveryFee);
        settings.setFreeDeliveryMinimum(freeDeliveryMinimum);

        return repository.save(settings);
    }
}
