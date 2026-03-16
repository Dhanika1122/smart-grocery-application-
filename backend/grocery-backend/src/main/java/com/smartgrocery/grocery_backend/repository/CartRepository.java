package com.smartgrocery.grocery_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrocery.grocery_backend.model.CartItem;

public interface CartRepository extends JpaRepository<CartItem, Long> {
}