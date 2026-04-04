package com.smartgrocery.grocery_backend.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.smartgrocery.grocery_backend.dto.AdminProfileResponse;
import com.smartgrocery.grocery_backend.model.Admin;
import com.smartgrocery.grocery_backend.repository.AdminRepository;

@Service
public class AdminProfileService {

    private static final List<String> DEFAULT_PERMISSIONS = Arrays.asList(
            "PRODUCTS_MANAGE",
            "ORDERS_MANAGE",
            "USERS_VIEW",
            "UPLOAD_MEDIA");

    @Autowired
    private AdminRepository adminRepository;

    public AdminProfileResponse getCurrentAdminProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Not authenticated");
        }

        String email = auth.getName();
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Admin not found"));

        AdminProfileResponse dto = new AdminProfileResponse();
        dto.setId(admin.getId());
        dto.setName(admin.getName());
        dto.setEmail(admin.getEmail());
        dto.setRole("ADMIN");
        dto.setLastLogin(admin.getLastLogin());
        dto.setPermissions(DEFAULT_PERMISSIONS);
        return dto;
    }
}
