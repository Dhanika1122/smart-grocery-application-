package com.smartgrocery.grocery_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartgrocery.grocery_backend.model.CustomerLocation;

@Repository
public interface CustomerLocationRepository extends JpaRepository<CustomerLocation, Long> {

    List<CustomerLocation> findByUserIdAndActiveTrueOrderByIdDesc(Long userId);

    Optional<CustomerLocation> findByIdAndUserIdAndActiveTrue(Long id, Long userId);

    Optional<CustomerLocation> findByIdAndUserId(Long id, Long userId);
}
