package com.smartgrocery.grocery_backend.repository;

import com.smartgrocery.grocery_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

}