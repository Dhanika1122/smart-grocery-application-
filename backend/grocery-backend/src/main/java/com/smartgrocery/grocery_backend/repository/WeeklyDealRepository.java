package com.smartgrocery.grocery_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartgrocery.grocery_backend.model.WeeklyDeal;

@Repository
public interface WeeklyDealRepository extends JpaRepository<WeeklyDeal, Long> {

    List<WeeklyDeal> findAllByOrderByDisplayOrderAscIdDesc();

    @Query("SELECT d FROM WeeklyDeal d WHERE d.active = true " +
           "AND (d.startDate IS NULL OR d.startDate <= :now) " +
           "AND (d.endDate IS NULL OR d.endDate >= :now) " +
           "ORDER BY d.displayOrder ASC, d.id DESC")
    List<WeeklyDeal> findActiveDeals(@Param("now") LocalDateTime now);

    @Query("SELECT d FROM WeeklyDeal d LEFT JOIN FETCH d.products WHERE d.id = :id")
    Optional<WeeklyDeal> findByIdWithProducts(@Param("id") Long id);
}
