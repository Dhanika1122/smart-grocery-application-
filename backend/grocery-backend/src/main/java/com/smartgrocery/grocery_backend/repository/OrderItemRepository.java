package com.smartgrocery.grocery_backend.repository;

import com.smartgrocery.grocery_backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
