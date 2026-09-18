package com.smartgrocery.grocery_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartgrocery.grocery_backend.dto.CategoryRequest;
import com.smartgrocery.grocery_backend.dto.CategoryResponse;
import com.smartgrocery.grocery_backend.model.Category;
import com.smartgrocery.grocery_backend.repository.CategoryRepository;
import com.smartgrocery.grocery_backend.repository.ProductRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void autoSeedExistingProductCategories() {
        // Step 1: Ensure all existing product categories in DB are present as Category records
        List<String> distinctCategories = productRepository.findDistinctCategories();
        int order = 1;
        for (String catName : distinctCategories) {
            if (catName != null && !catName.trim().isEmpty()) {
                String cleanName = catName.trim();
                if (!categoryRepository.existsByNameIgnoreCase(cleanName)) {
                    Category category = new Category(cleanName, "", true, order++);
                    categoryRepository.save(category);
                }
            }
        }

        // Step 2: If category table is still empty, seed default categories
        if (categoryRepository.count() == 0) {
            List<String> defaultNames = List.of(
                "Fruits", "Vegetables", "Dairy", "Bakery", "Meat", "Drinks", "Organic", "Snacks"
            );
            int displayIdx = 1;
            for (String name : defaultNames) {
                if (!categoryRepository.existsByNameIgnoreCase(name)) {
                    categoryRepository.save(new Category(name, "", true, displayIdx++));
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesForAdmin() {
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAscNameAsc();
        return categories.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryByIdForAdmin(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        validateRequest(request, null);

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setImage(request.getImage());
        category.setActive(request.getActive() != null ? request.getActive() : true);
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        validateRequest(request, id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));

        String oldName = category.getName();
        String newName = request.getName().trim();

        // If category name was updated, rename all assigned products accordingly
        if (!oldName.equalsIgnoreCase(newName)) {
            productRepository.updateCategoryName(oldName, newName);
        }

        category.setName(newName);
        category.setImage(request.getImage());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        Category updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));

        long count = productRepository.countByCategoryIgnoreCase(category.getName());
        if (count > 0) {
            throw new IllegalArgumentException("Cannot delete category '" + category.getName() + "' because " +
                    count + " product(s) are assigned to it. Please reassign the products or deactivate the category instead.");
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryResponse toggleCategoryStatus(Long id, Boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));

        boolean newStatus = active != null ? active : !category.isActive();
        category.setActive(newStatus);
        Category updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategoriesForCustomer() {
        List<Category> activeCategories = categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc();
        return activeCategories.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private void validateRequest(CategoryRequest request, Long currentId) {
        if (request == null) {
            throw new IllegalArgumentException("Category request cannot be null");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        String cleanName = request.getName().trim();

        if (currentId == null) {
            if (categoryRepository.existsByNameIgnoreCase(cleanName)) {
                throw new IllegalArgumentException("Category with name '" + cleanName + "' already exists");
            }
        } else {
            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(cleanName, currentId)) {
                throw new IllegalArgumentException("Category with name '" + cleanName + "' already exists");
            }
        }
    }

    public CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setImage(category.getImage());
        response.setActive(category.isActive());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());

        long productCount = productRepository.countByCategoryIgnoreCase(category.getName());
        response.setProductCount(productCount);

        return response;
    }
}
