package com.smartgrocery.grocery_backend.controller;

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

import com.smartgrocery.grocery_backend.model.User;
import com.smartgrocery.grocery_backend.security.JwtService;
import com.smartgrocery.grocery_backend.repository.UserRepository;

@RestController
@RequestMapping("/userauth")
@CrossOrigin(origins = "*")
public class UserAuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public User register(@RequestBody User user){

        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(user);

    }

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Map<String,String> data){

        String email = data.get("email");
        String password = data.get("password");

        Optional<User> user = userRepository.findByEmail(email);

        Map<String,Object> response = new HashMap<>();

        if(user.isPresent() && isPasswordMatch(password, user.get().getPassword())){

            response.put("status","success");
            response.put("user",user.get());

            Map<String,Object> claims = new HashMap<>();
            claims.put("role", "CUSTOMER");
            claims.put("userId", user.get().getId());

            String token = jwtService.generateToken(user.get().getEmail(), claims);
            response.put("token", token);

        }else{

            response.put("status","error");

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

        userRepository.findByEmail(email).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(u);
        });

        return response;
    }

    private boolean isPasswordMatch(String rawPassword, String storedPassword) {
        if (storedPassword == null) return false;

        // BCrypt hashed passwords
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        // Legacy plaintext support
        return storedPassword.equals(rawPassword);
    }

}