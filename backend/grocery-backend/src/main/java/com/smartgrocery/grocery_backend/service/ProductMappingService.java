package com.smartgrocery.grocery_backend.service;

import com.smartgrocery.grocery_backend.model.GroceryItem;
import com.smartgrocery.grocery_backend.model.Product;
import com.smartgrocery.grocery_backend.repository.ProductRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ProductMappingService {
    private final ProductRepository productRepository;

    public ProductMappingService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public static class MappingResult {
        private final List<Product> matchedProducts;
        private final List<String> unavailableItems;
        private final List<Product> fallbackProducts;

        public MappingResult(List<Product> matchedProducts, List<String> unavailableItems, List<Product> fallbackProducts) {
            this.matchedProducts = matchedProducts;
            this.unavailableItems = unavailableItems;
            this.fallbackProducts = fallbackProducts;
        }

        public List<Product> getMatchedProducts() {
            return matchedProducts;
        }

        public List<String> getUnavailableItems() {
            return unavailableItems;
        }

        public List<Product> getFallbackProducts() {
            return fallbackProducts;
        }
    }

    /**
     * Optimized mapping: loads products once, maps in-memory.
     * Avoids multiple DB calls per item.
     */
    public MappingResult mapAIItemsToProducts(List<GroceryItem> items) {
        List<GroceryItem> safeItems = items == null ? List.of() : items.stream().filter(Objects::nonNull).toList();
        if (safeItems.isEmpty()) {
            return new MappingResult(List.of(), List.of(), List.of());
        }

        List<Product> all = productRepository.findAll();
        if (all == null || all.isEmpty()) {
            List<String> unavailable = safeItems.stream()
                    .map(GroceryItem::getName)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();
            return new MappingResult(List.of(), unavailable, List.of());
        }

        List<Product> matched = new ArrayList<>();
        List<String> unavailable = new ArrayList<>();
        Set<Long> used = new HashSet<>();

        for (GroceryItem it : safeItems) {
            String name = it.getName();
            if (name == null || name.isBlank()) continue;
            String q = normalize(name);

            Product best = pickBest(all, q);
            if (best == null) {
                unavailable.add(name.trim());
                continue;
            }

            if (best.getId() != null && used.contains(best.getId())) {
                // avoid duplicates if AI repeats an item
                continue;
            }
            if (best.getId() != null) used.add(best.getId());
            matched.add(best);
        }

        // Fallback suggestions: if some items were unavailable, show top 6 "popular" matches by name similarity
        List<Product> fallback = List.of();
        if (!unavailable.isEmpty()) {
            String joined = String.join(" ", unavailable);
            String query = normalize(joined);
            fallback = all.stream()
                    .filter(Objects::nonNull)
                    .sorted((a, b) -> Integer.compare(score(query, normalize(b.getName())), score(query, normalize(a.getName()))))
                    .limit(6)
                    .collect(Collectors.toList());
        }

        // De-duplicate unavailable list
        unavailable = unavailable.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();

        return new MappingResult(matched, unavailable, fallback);
    }

    private Product pickBest(List<Product> all, String itemNorm) {
        // 1) exact match
        for (Product p : all) {
            if (p == null) continue;
            if (normalize(p.getName()).equals(itemNorm)) return p;
        }
        // 2) contains match
        for (Product p : all) {
            if (p == null) continue;
            String pn = normalize(p.getName());
            if (!pn.isBlank() && pn.contains(itemNorm)) return p;
        }
        // 3) similarity score
        Product best = null;
        int bestScore = -1;
        for (Product p : all) {
            if (p == null) continue;
            int s = score(itemNorm, normalize(p.getName()));
            if (s > bestScore) {
                bestScore = s;
                best = p;
            }
        }
        // Require a minimum score to avoid nonsense mappings
        return bestScore >= 20 ? best : null;
    }

    private String normalize(String s) {
        if (s == null) return "";
        String x = s.toLowerCase(Locale.ROOT).trim();
        x = x.replaceAll("[^a-z0-9\\s]", " ");
        x = x.replaceAll("\\s+", " ").trim();
        return x;
    }

    /**
     * Token overlap score 0..100 (higher is better).
     */
    private int score(String a, String b) {
        if (a == null || b == null) return 0;
        if (a.isBlank() || b.isBlank()) return 0;
        if (a.equals(b)) return 100;

        Set<String> ta = new HashSet<>(List.of(a.split(" ")));
        Set<String> tb = new HashSet<>(List.of(b.split(" ")));
        ta.removeIf(String::isBlank);
        tb.removeIf(String::isBlank);
        if (ta.isEmpty() || tb.isEmpty()) return 0;

        Set<String> inter = new HashSet<>(ta);
        inter.retainAll(tb);
        int intersection = inter.size();
        int union = ta.size() + tb.size() - intersection;
        return (int) Math.round((intersection * 100.0) / Math.max(1, union));
    }
}

