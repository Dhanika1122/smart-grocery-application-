package com.smartgrocery.grocery_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Add product
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Delete product
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}