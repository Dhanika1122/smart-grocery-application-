package com.smartgrocery.grocery_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartgrocery.grocery_backend.dto.DealProductDto;
import com.smartgrocery.grocery_backend.dto.WeeklyDealRequest;
import com.smartgrocery.grocery_backend.dto.WeeklyDealResponse;
import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.model.WeeklyDeal;
import com.smartgrocery.grocery_backend.repository.ProductRepository;
import com.smartgrocery.grocery_backend.repository.WeeklyDealRepository;

@Service
public class WeeklyDealService {

    private final WeeklyDealRepository dealRepository;
    private final ProductRepository productRepository;

    public WeeklyDealService(WeeklyDealRepository dealRepository, ProductRepository productRepository) {
        this.dealRepository = dealRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<WeeklyDealResponse> getAllDealsForAdmin() {
        List<WeeklyDeal> deals = dealRepository.findAllByOrderByDisplayOrderAscIdDesc();
        return deals.stream().map(deal -> toResponse(deal, true)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WeeklyDealResponse getDealByIdForAdmin(Long id) {
        WeeklyDeal deal = dealRepository.findByIdWithProducts(id)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found with ID: " + id));
        return toResponse(deal, true);
    }

    @Transactional
    public WeeklyDealResponse createDeal(WeeklyDealRequest request) {
        validateRequest(request);

        WeeklyDeal deal = new WeeklyDeal();
        deal.setTitle(request.getTitle().trim());
        deal.setDescription(request.getDescription());
        deal.setImage(request.getImage());
        deal.setDiscountPercentage(request.getDiscountPercentage());
        deal.setStartDate(request.getStartDate());
        deal.setEndDate(request.getEndDate());
        deal.setActive(request.getActive() != null ? request.getActive() : true);
        deal.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        WeeklyDeal saved = dealRepository.save(deal);
        return toResponse(saved, true);
    }

    @Transactional
    public WeeklyDealResponse updateDeal(Long id, WeeklyDealRequest request) {
        validateRequest(request);

        WeeklyDeal deal = dealRepository.findByIdWithProducts(id)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found with ID: " + id));

        deal.setTitle(request.getTitle().trim());
        deal.setDescription(request.getDescription());
        deal.setImage(request.getImage());
        deal.setDiscountPercentage(request.getDiscountPercentage());
        deal.setStartDate(request.getStartDate());
        deal.setEndDate(request.getEndDate());
        if (request.getActive() != null) {
            deal.setActive(request.getActive());
        }
        if (request.getDisplayOrder() != null) {
            deal.setDisplayOrder(request.getDisplayOrder());
        }

        WeeklyDeal updated = dealRepository.save(deal);
        return toResponse(updated, true);
    }

    @Transactional
    public void deleteDeal(Long id) {
        if (!dealRepository.existsById(id)) {
            throw new IllegalArgumentException("Deal not found with ID: " + id);
        }
        dealRepository.deleteById(id);
    }

    @Transactional
    public WeeklyDealResponse toggleDealStatus(Long id, Boolean active) {
        WeeklyDeal deal = dealRepository.findByIdWithProducts(id)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found with ID: " + id));

        boolean newStatus = active != null ? active : !deal.isActive();
        deal.setActive(newStatus);
        WeeklyDeal updated = dealRepository.save(deal);
        return toResponse(updated, true);
    }

    @Transactional
    public WeeklyDealResponse addProductsToDeal(Long dealId, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new IllegalArgumentException("Product IDs list cannot be empty");
        }

        WeeklyDeal deal = dealRepository.findByIdWithProducts(dealId)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found with ID: " + dealId));

        List<Product> productsToAdd = productRepository.findAllById(productIds);
        if (productsToAdd.isEmpty()) {
            throw new IllegalArgumentException("No valid products found for provided IDs");
        }

        Set<Product> currentProducts = deal.getProducts();
        currentProducts.addAll(productsToAdd);
        deal.setProducts(currentProducts);

        WeeklyDeal updated = dealRepository.save(deal);
        return toResponse(updated, true);
    }

    @Transactional
    public WeeklyDealResponse removeProductFromDeal(Long dealId, Long productId) {
        WeeklyDeal deal = dealRepository.findByIdWithProducts(dealId)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found with ID: " + dealId));

        Set<Product> currentProducts = deal.getProducts();
        currentProducts.removeIf(p -> p.getId().equals(productId));
        deal.setProducts(currentProducts);

        WeeklyDeal updated = dealRepository.save(deal);
        return toResponse(updated, true);
    }

    @Transactional(readOnly = true)
    public List<WeeklyDealResponse> getActiveDealsForCustomer() {
        LocalDateTime now = LocalDateTime.now();
        List<WeeklyDeal> activeDeals = dealRepository.findActiveDeals(now);
        return activeDeals.stream().map(deal -> toResponse(deal, true)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WeeklyDealResponse getActiveDealByIdForCustomer(Long id) {
        WeeklyDeal deal = dealRepository.findByIdWithProducts(id)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found with ID: " + id));

        if (!deal.isActive()) {
            throw new IllegalArgumentException("Deal is currently inactive");
        }

        LocalDateTime now = LocalDateTime.now();
        if (deal.getStartDate() != null && deal.getStartDate().isAfter(now)) {
            throw new IllegalArgumentException("Deal is not active yet");
        }
        if (deal.getEndDate() != null && deal.getEndDate().isBefore(now)) {
            throw new IllegalArgumentException("Deal has expired");
        }

        return toResponse(deal, true);
    }

    private void validateRequest(WeeklyDealRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Deal request cannot be null");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Deal title is required");
        }
        if (request.getDiscountPercentage() < 0 || request.getDiscountPercentage() > 100) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getStartDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
        }
    }

    public WeeklyDealResponse toResponse(WeeklyDeal deal, boolean includeProducts) {
        WeeklyDealResponse response = new WeeklyDealResponse();
        response.setId(deal.getId());
        response.setTitle(deal.getTitle());
        response.setDescription(deal.getDescription());
        response.setImage(deal.getImage());
        response.setDiscountPercentage(deal.getDiscountPercentage());
        response.setStartDate(deal.getStartDate());
        response.setEndDate(deal.getEndDate());
        response.setActive(deal.isActive());
        response.setDisplayOrder(deal.getDisplayOrder());
        response.setCreatedAt(deal.getCreatedAt());
        response.setUpdatedAt(deal.getUpdatedAt());

        Set<Product> products = deal.getProducts();
        response.setProductCount(products != null ? products.size() : 0);

        if (includeProducts && products != null) {
            List<DealProductDto> productDtos = new ArrayList<>();
            for (Product p : products) {
                double originalPrice = p.getPrice();
                double discountPct = deal.getDiscountPercentage();
                double offerPrice = Math.max(0.0, Math.round(originalPrice * (1.0 - (discountPct / 100.0)) * 100.0) / 100.0);

                DealProductDto dto = new DealProductDto(
                    p.getId(),
                    p.getName(),
                    p.getCategory(),
                    originalPrice,
                    offerPrice,
                    p.getStock(),
                    p.getImage()
                );
                productDtos.add(dto);
            }
            productDtos.sort(Comparator.comparing(DealProductDto::getName, String.CASE_INSENSITIVE_ORDER));
            response.setProducts(productDtos);
        } else {
            response.setProducts(List.of());
        }

        return response;
    }
}
