package com.smartgrocery.grocery_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartgrocery.grocery_backend.model.CartItem;
import com.smartgrocery.grocery_backend.repository.CartRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    // Add item to cart
    public CartItem addToCart(CartItem item) {
        return cartRepository.save(item);
    }

    // Get all cart items
    public List<CartItem> getCartItems() {
        return cartRepository.findAll();
    }

    // Remove item from cart
    public void removeItem(Long id) {
        cartRepository.deleteById(id);
    }
}