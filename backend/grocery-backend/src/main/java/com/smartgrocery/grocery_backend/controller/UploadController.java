package com.smartgrocery.grocery_backend.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@RestController
@CrossOrigin(origins = "*")
public class UploadController {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:}")
    private String folder;

    @PostMapping("/upload")
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {

        Map<String, String> response = new HashMap<>();
        response.put("status", "error");

        if (file == null || file.isEmpty()) {
            response.put("secure_url", "https://via.placeholder.com/150");
            response.put("error", "Empty file");
            return response;
        }

        // If Cloudinary isn't configured yet, keep the app working.
        if (cloudName == null || cloudName.isBlank() || apiKey == null || apiKey.isBlank() || apiSecret == null
                || apiSecret.isBlank()) {
            response.put("secure_url", "https://via.placeholder.com/150");
            response.put("error", "Cloudinary is not configured in application.properties");
            return response;
        }

        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret));

            Map<String, Object> options = ObjectUtils.asMap();
            options.put("resource_type", "image");
            if (folder != null && !folder.isBlank()) {
                options.put("folder", folder);
            }

            // cloudinary-http44 returns a Map (contains fields like `secure_url`)
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            String secureUrl = (String) uploadResult.get("secure_url");

            response.put("secure_url", secureUrl);
            if (secureUrl == null || secureUrl.isBlank()) {
                response.put("error", "Cloudinary response did not contain secure_url");
                return response;
            }
            response.put("status", "success");
        } catch (IOException e) {
            response.put("secure_url", "https://via.placeholder.com/150");
            response.put("error", e.getMessage());
        } catch (Exception e) {
            response.put("secure_url", "https://via.placeholder.com/150");
            response.put("error", e.getMessage());
        }

        return response;
    }
}