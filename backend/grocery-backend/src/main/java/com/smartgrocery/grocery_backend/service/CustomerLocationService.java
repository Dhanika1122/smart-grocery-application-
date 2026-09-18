package com.smartgrocery.grocery_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartgrocery.grocery_backend.dto.CustomerLocationRequest;
import com.smartgrocery.grocery_backend.dto.CustomerLocationResponse;
import com.smartgrocery.grocery_backend.model.CustomerLocation;
import com.smartgrocery.grocery_backend.model.User;
import com.smartgrocery.grocery_backend.repository.CustomerLocationRepository;
import com.smartgrocery.grocery_backend.repository.UserRepository;

@Service
public class CustomerLocationService {

    private final CustomerLocationRepository locationRepository;
    private final UserRepository userRepository;

    public CustomerLocationService(CustomerLocationRepository locationRepository, UserRepository userRepository) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerLocationResponse> getLocationsForAuthenticatedUser() {
        Long userId = getAuthenticatedUserIdOrThrow();
        List<CustomerLocation> locations = locationRepository.findByUserIdAndActiveTrueOrderByIdDesc(userId);
        return locations.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerLocationResponse getLocationByIdForAuthenticatedUser(Long id) {
        Long userId = getAuthenticatedUserIdOrThrow();
        CustomerLocation location = locationRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new AccessDeniedException("Location not found or access denied"));
        return toResponse(location);
    }

    @Transactional
    public CustomerLocationResponse createLocationForAuthenticatedUser(CustomerLocationRequest request) {
        Long userId = getAuthenticatedUserIdOrThrow();
        validateLocationRequest(request);

        CustomerLocation location = new CustomerLocation();
        location.setUserId(userId);
        location.setLabel(request.getLabel() != null && !request.getLabel().isBlank() ? request.getLabel().trim() : "Home");
        location.setAddress(request.getAddress().trim());
        location.setLandmark(request.getLandmark() != null ? request.getLandmark().trim() : "");
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setActive(true);

        CustomerLocation saved = locationRepository.save(location);
        return toResponse(saved);
    }

    @Transactional
    public CustomerLocationResponse updateLocationForAuthenticatedUser(Long id, CustomerLocationRequest request) {
        Long userId = getAuthenticatedUserIdOrThrow();
        validateLocationRequest(request);

        CustomerLocation location = locationRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new AccessDeniedException("Location not found or access denied"));

        location.setLabel(request.getLabel() != null && !request.getLabel().isBlank() ? request.getLabel().trim() : "Home");
        location.setAddress(request.getAddress().trim());
        location.setLandmark(request.getLandmark() != null ? request.getLandmark().trim() : "");
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());

        CustomerLocation updated = locationRepository.save(location);
        return toResponse(updated);
    }

    @Transactional
    public void deleteLocationForAuthenticatedUser(Long id) {
        Long userId = getAuthenticatedUserIdOrThrow();
        CustomerLocation location = locationRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new AccessDeniedException("Location not found or access denied"));

        // Soft delete to ensure no integrity violations
        location.setActive(false);
        locationRepository.save(location);
    }

    public void validateLocationRequest(CustomerLocationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Location details are required");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new IllegalArgumentException("Delivery address is required");
        }
        if (request.getLatitude() == null || request.getLatitude() < -90.0 || request.getLatitude() > 90.0) {
            throw new IllegalArgumentException("Valid latitude (-90 to +90) is required");
        }
        if (request.getLongitude() == null || request.getLongitude() < -180.0 || request.getLongitude() > 180.0) {
            throw new IllegalArgumentException("Valid longitude (-180 to +180) is required");
        }
    }

    public CustomerLocationResponse toResponse(CustomerLocation location) {
        CustomerLocationResponse response = new CustomerLocationResponse();
        response.setId(location.getId());
        response.setUserId(location.getUserId());
        response.setLabel(location.getLabel());
        response.setAddress(location.getAddress());
        response.setLandmark(location.getLandmark());
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());
        response.setActive(location.isActive());
        response.setCreatedAt(location.getCreatedAt());
        response.setUpdatedAt(location.getUpdatedAt());
        return response;
    }

    public Long getAuthenticatedUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }
        String email = auth.getName();
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Invalid authentication principal");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("User profile not found for authenticated principal"));
        return user.getId();
    }
}
