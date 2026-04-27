package com.smartgrocery.grocery_backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.Admin;
import com.smartgrocery.grocery_backend.security.JwtService;
import com.smartgrocery.grocery_backend.repository.AdminRepository;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuthController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtService jwtService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public Admin register(@RequestBody Admin admin) {
        // Hash password for new registrations.
        // If admin table already contains plaintext passwords, login supports both.
        if (admin.getPassword() != null && !admin.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        }
        return adminRepository.save(admin);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        Optional<Admin> admin = adminRepository.findByEmail(email);

        Map<String, Object> response = new HashMap<>();

        if (admin.isPresent() && isPasswordMatch(password, admin.get().getPassword())) {
            Admin a = admin.get();
            a.setLastLogin(LocalDateTime.now());
            a = adminRepository.save(a);

            response.put("status", "success");
            response.put("admin", a);

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", "ADMIN");
            claims.put("adminId", a.getId());

            String token = jwtService.generateToken(a.getEmail(), claims);
            response.put("token", token);
        } else {
            response.put("status", "error");
        }

        return response;
    }

    // Minimal forgot-password endpoint (UI-only reset).
    // For production you should send email + reset token.
    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String newPassword = data.get("newPassword");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");

        if (email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
            response.put("status", "error");
            response.put("message", "Missing email or newPassword");
            return response;
        }

        adminRepository.findByEmail(email).ifPresent(a -> {
            a.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(a);
        });

        // Avoid user enumeration; always return success.
        return response;
    }

    private boolean isPasswordMatch(String rawPassword, String storedPassword) {
        if (storedPassword == null) return false;

        // If password looks like BCrypt hash, validate via matches.
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        // Legacy plaintext support.
        return storedPassword.equals(rawPassword);
    }
}

