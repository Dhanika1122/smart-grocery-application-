package com.smartgrocery.grocery_backend.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.smartgrocery.grocery_backend.model.Admin;
import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.repository.AdminRepository;
import com.smartgrocery.grocery_backend.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AdminRepository adminRepository;

    public ProductService(ProductRepository productRepository, AdminRepository adminRepository) {
        this.productRepository = productRepository;
        this.adminRepository = adminRepository;
    }

    // Add product
    public Product saveProduct(Product product) {
        // Tenant isolation: always attach the logged-in ADMIN (from SecurityContext).
        Admin authenticatedAdmin = getAuthenticatedAdminOrNull();
        if (authenticatedAdmin != null) {
            product.setAdmin(authenticatedAdmin);
        } else if (product.getAdmin() != null && product.getAdmin().getId() != null) {
            // Fallback for legacy calls (should be avoided for protected endpoints).
            Long adminId = product.getAdmin().getId();
            Admin managedAdmin = adminRepository.findById(adminId).orElseThrow();
            product.setAdmin(managedAdmin);
        }

        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Delete product
    public void deleteProduct(Long id) {
        // Enforce ownership before delete.
        getProductById(id);
        productRepository.deleteById(id);
    }

    public Product getProductById(Long id){
        Product product = productRepository.findById(id).orElseThrow();

        // Enforce ownership for admins.
        Admin authenticatedAdmin = getAuthenticatedAdminOrNull();
        if (authenticatedAdmin != null) {
            if (product.getAdmin() == null || product.getAdmin().getId() == null
                    || !product.getAdmin().getId().equals(authenticatedAdmin.getId())) {
                throw new AccessDeniedException("You do not have access to this product");
            }
        }

        return product;
    }

    public List<Product> getProductsByAdmin(Long adminId) {
        return productRepository.findByAdmin_Id(adminId);
    }

    public Long getAuthenticatedAdminIdOrNull() {
        Admin admin = getAuthenticatedAdminOrNull();
        return admin != null ? admin.getId() : null;
    }

    private Admin getAuthenticatedAdminOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) return null;

        String email = auth.getName();
        if (email == null || email.isBlank()) return null;

        return adminRepository.findByEmail(email).orElseThrow();
    }

}