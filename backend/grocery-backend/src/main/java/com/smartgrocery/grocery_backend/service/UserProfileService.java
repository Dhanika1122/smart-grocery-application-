package com.smartgrocery.grocery_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartgrocery.grocery_backend.dto.ProfileImageUploadResponse;
import com.smartgrocery.grocery_backend.dto.UserProfileResponse;
import com.smartgrocery.grocery_backend.dto.UserProfileUpdateRequest;
import com.smartgrocery.grocery_backend.model.User;
import com.smartgrocery.grocery_backend.repository.UserRepository;

@Service
public class UserProfileService {

    private static final String PROFILE_URL_PREFIX = "/uploads/profile/";

    @Autowired
    private UserRepository userRepository;

    @Value("${app.profile-upload-dir:uploads/profile}")
    private String profileUploadDir;

    @Value("${app.profile-image-max-bytes:2097152}")
    private long profileImageMaxBytes;

    public UserProfileResponse getCurrentUserProfile() {
        User user = getCurrentUserEntity();
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UserProfileUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        User user = getCurrentUserEntity();

        user.setName(request.getName().trim());
        user.setPhone(blankToNull(request.getPhone()));
        user.setAddress(blankToNull(request.getAddress()));

        if (request.getAge() != null) {
            int age = request.getAge();
            if (age < 1 || age > 130) {
                throw new IllegalArgumentException("Age must be between 1 and 130");
            }
            user.setAge(age);
        }

        // Allow clearing gender when client sends empty string; omit age key to leave age unchanged.
        user.setGender(blankToNull(request.getGender()));

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public ProfileImageUploadResponse uploadProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        if (file.getSize() > profileImageMaxBytes) {
            throw new IllegalArgumentException("Image file is too large (max 2 MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null
                || (!contentType.equalsIgnoreCase("image/jpeg") && !contentType.equalsIgnoreCase("image/png"))) {
            throw new IllegalArgumentException("Only JPG and PNG images are allowed");
        }

        String ext = resolveExtension(file.getOriginalFilename(), contentType);
        if (ext == null) {
            throw new IllegalArgumentException("Only JPG and PNG images are allowed");
        }

        User user = getCurrentUserEntity();

        Path dir = Paths.get(profileUploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory", e);
        }

        deletePreviousIfLocal(user.getProfileImage());

        String filename = UUID.randomUUID() + ext;
        Path target = dir.resolve(filename);

        try {
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new IllegalStateException("Could not store image", e);
        }

        String publicPath = PROFILE_URL_PREFIX + filename;
        user.setProfileImage(publicPath);
        userRepository.save(user);

        return new ProfileImageUploadResponse(publicPath);
    }

    private void deletePreviousIfLocal(String previousPath) {
        if (previousPath == null || !previousPath.startsWith(PROFILE_URL_PREFIX)) {
            return;
        }
        String name = previousPath.substring(PROFILE_URL_PREFIX.length());
        if (name.isEmpty() || name.contains("..") || name.contains("/") || name.contains("\\")) {
            return;
        }
        Path p = Paths.get(profileUploadDir).toAbsolutePath().normalize().resolve(name);
        try {
            Files.deleteIfExists(p);
        } catch (IOException ignored) {
            // best-effort cleanup
        }
    }

    private static String resolveExtension(String originalFilename, String contentType) {
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase(Locale.ROOT);
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                return ".jpg";
            }
            if (lower.endsWith(".png")) {
                return ".png";
            }
        }
        if ("image/jpeg".equalsIgnoreCase(contentType)) {
            return ".jpg";
        }
        if ("image/png".equalsIgnoreCase(contentType)) {
            return ".png";
        }
        return null;
    }

    private static String blankToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Not authenticated");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private UserProfileResponse toResponse(User user) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setAge(user.getAge());
        dto.setGender(user.getGender());
        dto.setRole("CUSTOMER");
        dto.setCreatedAt(user.getCreatedAt());
        dto.setProfileImage(user.getProfileImage());
        return dto;
    }
}
