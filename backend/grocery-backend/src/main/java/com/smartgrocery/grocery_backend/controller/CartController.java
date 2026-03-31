package com.smartgrocery.grocery_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartgrocery.grocery_backend.model.CartItem;
import com.smartgrocery.grocery_backend.service.CartService;

@RestController
@RequestMapping("/cart")
@CrossOrigin
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Add product to cart
    @PostMapping
    public CartItem addToCart(@RequestBody CartItem item) {
        return cartService.addToCart(item);
    }

    // Get cart items
    @GetMapping
    public List<CartItem> getCart() {
        return cartService.getCartItems();
    }

    // Delete cart item
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        cartService.removeItem(id);
    }

    @PutMapping("/{id}")
public CartItem updateQuantity(@PathVariable Long id, @RequestBody CartItem item) {
    return cartService.updateQuantity(id, item.getQuantity());
} 

}