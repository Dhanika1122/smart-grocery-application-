package com.smartgrocery.grocery_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartgrocery.grocery_backend.model.DeliverySettings;

@Repository
public interface DeliverySettingsRepository extends JpaRepository<DeliverySettings, Long> {
}
