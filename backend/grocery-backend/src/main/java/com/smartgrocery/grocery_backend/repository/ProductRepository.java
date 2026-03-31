package com.smartgrocery.grocery_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrocery.grocery_backend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);
    // Product has ManyToOne field named `admin`; query via `admin.id`
    List<Product> findByAdmin_Id(Long adminId);

}