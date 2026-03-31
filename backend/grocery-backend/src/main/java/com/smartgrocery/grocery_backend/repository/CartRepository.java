package com.smartgrocery.grocery_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrocery.grocery_backend.model.CartItem;

public interface CartRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserId(Long userId);

    java.util.Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}