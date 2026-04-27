package com.smartgrocery.grocery_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusMigrationRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public OrderStatusMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        int normalizedDelivered = jdbcTemplate.update("""
                UPDATE orders
                SET status = 'DELIVERED'
                WHERE UPPER(TRIM(status)) = 'DELIVERED'
                """);

        int normalizedCancelled = jdbcTemplate.update("""
                UPDATE orders
                SET status = 'CANCELLED'
                WHERE UPPER(TRIM(status)) = 'CANCELLED'
                """);

        int normalizedPending = jdbcTemplate.update("""
                UPDATE orders
                SET status = 'PENDING'
                WHERE status IS NULL
                   OR TRIM(status) = ''
                   OR UPPER(TRIM(status)) IN ('PENDING', 'PENDING ', 'PACKED', 'SHIPPED', 'CONFIRMED')
                   OR UPPER(TRIM(status)) NOT IN ('PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
                """);

        int normalizedOutForDelivery = jdbcTemplate.update("""
                UPDATE orders
                SET status = 'OUT_FOR_DELIVERY'
                WHERE UPPER(TRIM(status)) = 'OUT_FOR_DELIVERY'
                """);

        log.info(
                "Normalized legacy order statuses. pending={}, outForDelivery={}, delivered={}, cancelled={}",
                normalizedPending,
                normalizedOutForDelivery,
                normalizedDelivered,
                normalizedCancelled
        );
    }
}
