package com.smartgrocery.grocery_backend.repository;

import com.smartgrocery.grocery_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByProductIdIn(List<Long> productIds);

    List<Order> findByUserId(Long userId);

}