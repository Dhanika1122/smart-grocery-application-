package com.smartgrocery.grocery_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.service.ProductService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Add product
    @PostMapping
public Product addProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    // Get all products
    @GetMapping
public List<Product> getProducts(@RequestParam(required = false) Long adminId) {
    // Admin isolation: if JWT admin is authenticated, always return only their products.
    // Ignore `adminId` query param to prevent cross-tenant access.
    Long authenticatedAdminId = productService.getAuthenticatedAdminIdOrNull();
    if (authenticatedAdminId != null) {
        return productService.getProductsByAdmin(authenticatedAdminId);
    }

    return productService.getAllProducts(); // public fallback
    }

    // Delete product
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PutMapping("/{id}")
public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {

        Product existing = productService.getProductById(id);

            // The frontend sometimes sends stock-only updates: { stock: newStock }.
            // In that case, the other fields may deserialize as null/0, which would
            // accidentally wipe data. Detect stock-only payload and update only stock.
            boolean isStockOnlyUpdate = product.getName() == null
                    && product.getCategory() == null
                    && product.getImage() == null
                    && product.getPrice() == 0.0;

            existing.setStock(product.getStock());
            if (!isStockOnlyUpdate) {
                existing.setName(product.getName());
                existing.setCategory(product.getCategory());
                existing.setPrice(product.getPrice());
                existing.setImage(product.getImage());
            }

        return productService.saveProduct(existing);
    }
}
