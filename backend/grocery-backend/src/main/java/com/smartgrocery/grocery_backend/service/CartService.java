package com.smartgrocery.grocery_backend.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.smartgrocery.grocery_backend.model.CartItem;
import com.smartgrocery.grocery_backend.model.User;
import com.smartgrocery.grocery_backend.repository.UserRepository;
import com.smartgrocery.grocery_backend.repository.CartRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    // Add item to cart
    public CartItem addToCart(CartItem item) {
        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        if (authenticatedUserId != null) {
            item.setUserId(authenticatedUserId);
        }
        return cartRepository.save(item);
    }

    // Get all cart items
    public List<CartItem> getCartItems() {
        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        if (authenticatedUserId == null) {
            return cartRepository.findAll();
        }
        return cartRepository.findByUserId(authenticatedUserId);
    }

    // Remove item from cart
    public void removeItem(Long id) {
        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        if (authenticatedUserId == null) {
            cartRepository.deleteById(id);
            return;
        }
        cartRepository.deleteByIdAndUserId(id, authenticatedUserId);
    }

    public CartItem updateQuantity(Long id, int quantity) {

        Long authenticatedUserId = getAuthenticatedUserIdOrNull();
        CartItem item;
        if (authenticatedUserId != null) {
            item = cartRepository.findByIdAndUserId(id, authenticatedUserId)
                    .orElseThrow(() -> new AccessDeniedException("You do not have access to this cart item"));
        } else {
            item = cartRepository.findById(id).orElseThrow();
        }

        item.setQuantity(quantity);

        return cartRepository.save(item);
    }

    private Long getAuthenticatedUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        boolean isCustomer = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()));
        if (!isCustomer) return null;

        String email = auth.getName();
        if (email == null || email.isBlank()) return null;

        User user = userRepository.findByEmail(email).orElseThrow();
        return user.getId();
    }

}