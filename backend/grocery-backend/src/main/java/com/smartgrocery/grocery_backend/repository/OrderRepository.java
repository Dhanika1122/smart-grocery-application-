package com.smartgrocery.grocery_backend.repository;

import com.smartgrocery.grocery_backend.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByProductIdIn(List<Long> productIds);

    List<Order> findByUserId(Long userId);

    @Override
    @EntityGraph(attributePaths = {"items", "items.product", "items.product.admin"})
    List<Order> findAll();

    @EntityGraph(attributePaths = {"items", "items.product", "items.product.admin"})
    List<Order> findAllByUserId(Long userId);

    @EntityGraph(attributePaths = {"items", "items.product", "items.product.admin"})
    Optional<Order> findWithItemsById(Long id);

}
