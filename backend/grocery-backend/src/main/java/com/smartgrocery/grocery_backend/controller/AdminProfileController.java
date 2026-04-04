package com.smartgrocery.grocery_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.dto.AdminProfileResponse;
import com.smartgrocery.grocery_backend.service.AdminProfileService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminProfileController {

    @Autowired
    private AdminProfileService adminProfileService;

    @GetMapping("/profile")
    public AdminProfileResponse getProfile() {
        return adminProfileService.getCurrentAdminProfile();
    }
}
