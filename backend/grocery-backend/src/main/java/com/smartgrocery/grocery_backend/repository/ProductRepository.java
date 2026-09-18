package com.smartgrocery.grocery_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartgrocery.grocery_backend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByAdmin_Id(Long adminId);

    long countByCategoryIgnoreCase(String category);

    List<Product> findByCategoryIgnoreCase(String category);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL AND TRIM(p.category) != ''")
    List<String> findDistinctCategories();

    @Modifying
    @Query("UPDATE Product p SET p.category = :newName WHERE LOWER(p.category) = LOWER(:oldName)")
    void updateCategoryName(@Param("oldName") String oldName, @Param("newName") String newName);
}