package com.smartgrocery.grocery_backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartgrocery.grocery_backend.model.GroceryItem;
import com.smartgrocery.grocery_backend.model.SmartBudgetResponse;
import com.smartgrocery.grocery_backend.model.SmartDietPlan;
import com.smartgrocery.grocery_backend.model.SmartHealthResponse;
import com.smartgrocery.grocery_backend.model.SmartRecipeResponse;

@Service
public class AIService {
    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key:}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${openai.chat-completions-url:https://api.openai.com/v1/chat/completions}")
    private String openaiChatCompletionsUrl;

    public AIService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private SmartDietPlan fallbackPlan() {
        SmartDietPlan plan = new SmartDietPlan();
        plan.setBreakfast(Collections.emptyList());
        plan.setLunch(Collections.emptyList());
        plan.setDinner(Collections.emptyList());
        plan.setGrocery(Collections.emptyList());
        plan.setWeeklyPlan(Collections.emptyList());
        plan.setWaterIntake("—");
        plan.setDoctorTips(Collections.emptyList());
        return plan;
    }

    private String extractJsonObject(String content) {
        if (content == null) return null;
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }

    private List<String> parseStringArray(JsonNode node) {
        if (node == null || !node.isArray()) return Collections.emptyList();
        List<String> out = new ArrayList<>();
        for (JsonNode v : node) {
            if (v == null || v.isNull()) continue;
            out.add(v.asText());
        }
        return out;
    }

    private List<GroceryItem> parseGrocery(JsonNode node) {
        if (node == null || !node.isArray()) return Collections.emptyList();
        List<GroceryItem> out = new ArrayList<>();
        for (JsonNode item : node) {
            if (item == null || item.isNull()) continue;
            GroceryItem gi = new GroceryItem();
            gi.setName(item.path("name").asText(""));
            gi.setQty(item.path("qty").asText(""));
            // Keep only items that have at least one non-empty field.
            if (!gi.getName().isBlank() || !gi.getQty().isBlank()) {
                out.add(gi);
            }
        }
        return out;
    }

    private List<String> parseSteps(JsonNode node) {
        return parseStringArray(node);
    }

    private SmartBudgetResponse fallbackBudget() {
        SmartBudgetResponse r = new SmartBudgetResponse();
        r.setDayWiseMealPlan(Collections.emptyList());
        r.setGrocery(Collections.emptyList());
        r.setDuration("—");
        r.setTotalCostPerDay(0.0);
        r.setProducts(Collections.emptyList());
        return r;
    }

    private SmartRecipeResponse fallbackRecipe(String recipeName, int members) {
        SmartRecipeResponse r = new SmartRecipeResponse();
        r.setRecipeName(recipeName);
        r.setMembers(members);
        r.setImageUrl("https://via.placeholder.com/600x360?text=Recipe");
        r.setGrocery(Collections.emptyList());
        r.setSteps(Collections.emptyList());
        r.setProducts(Collections.emptyList());
        return r;
    }

    private SmartHealthResponse fallbackHealth(String condition) {
        SmartHealthResponse r = new SmartHealthResponse();
        r.setCondition(condition);
        r.setFoodsToEat(Collections.emptyList());
        r.setFoodsToAvoid(Collections.emptyList());
        r.setReasons(Collections.emptyList());
        r.setWeeklyPlan(Collections.emptyList());
        r.setProductsToEat(Collections.emptyList());
        return r;
    }

    private JsonNode callOpenAIJsonObject(String systemPrompt, String userPrompt, int maxTokens) throws Exception {
        ObjectNode requestBody = objectMapper.createObjectNode()
                .put("model", openaiModel)
                .put("temperature", 0.2)
                .put("max_tokens", maxTokens);

        requestBody.set("response_format", objectMapper.createObjectNode().put("type", "json_object"));

        ArrayNode messages = requestBody.putArray("messages");
        messages.add(objectMapper.createObjectNode().put("role", "system").put("content", systemPrompt));
        messages.add(objectMapper.createObjectNode().put("role", "user").put("content", userPrompt));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(openaiChatCompletionsUrl))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("OpenAI failed: " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode choices = root.path("choices");
        String content = null;
        if (choices.isArray() && choices.size() > 0) {
            content = choices.get(0).path("message").path("content").asText(null);
        }
        if (content == null || content.isBlank()) {
            throw new IllegalStateException("OpenAI returned empty content");
        }

        String json = extractJsonObject(content);
        return objectMapper.readTree(json);
    }

    public SmartDietPlan generateSmartDietPlan(String input) {
        
        System.out.println("API KEY VALUE: " + openaiApiKey);
        
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            log.warn("OpenAI API key is missing. Returning fallback smart diet plan.");
            return fallbackPlan();
        }

        String safeInput = (input == null ? "" : input.trim());

        // Prompt engineering: strict JSON output with exact schema.
        String systemPrompt = "You are a nutrition assistant for a grocery store. "
                + "Return ONLY valid JSON. No markdown. No backticks. No extra keys.";

        String userPrompt = ""
                + "Generate a smart diet plan based on the following input:\n"
                + safeInput + "\n\n"
                + "Return STRICT JSON with EXACT keys and types:\n"
                + "{\n"
                + "  \"breakfast\": [\"string\"],\n"
                + "  \"lunch\": [\"string\"],\n"
                + "  \"dinner\": [\"string\"],\n"
                + "  \"grocery\": [{\"name\":\"string\",\"qty\":\"string\"}],\n"
                + "  \"weeklyPlan\": [\"string\"],\n"
                + "  \"waterIntake\": \"string\",\n"
                + "  \"doctorTips\": [\"string\"]\n"
                + "}\n\n"
                + "Rules:\n"
                + "- grocery must be an array (can be empty), and each item must contain name and qty strings.\n"
                + "- weeklyPlan and doctorTips should be practical, safety-focused suggestions.\n"
                + "- waterIntake should be a friendly string like \"2.5 L/day\".\n";

        try {
            // Build request body.
            ObjectNode requestBody = objectMapper.createObjectNode()
                    .put("model", openaiModel)
                    .put("temperature", 0.2)
                    .put("max_tokens", 900);

            // Best-effort JSON enforcement (some models may ignore unsupported fields).
            requestBody.set("response_format", objectMapper.createObjectNode().put("type", "json_object"));

            ArrayNode messages = requestBody.putArray("messages");
            messages.add(objectMapper.createObjectNode().put("role", "system").put("content", systemPrompt));
            messages.add(objectMapper.createObjectNode().put("role", "user").put("content", userPrompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(openaiChatCompletionsUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("OpenAI request failed with status {}: {}", response.statusCode(), response.body());
                return fallbackPlan();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            String content = null;
            if (choices.isArray() && choices.size() > 0) {
                content = choices.get(0).path("message").path("content").asText(null);
            }

            if (content == null || content.isBlank()) {
                log.warn("OpenAI returned empty content.");
                return fallbackPlan();
            }

            String json = extractJsonObject(content);
            JsonNode planNode = objectMapper.readTree(json);

            SmartDietPlan plan = new SmartDietPlan();
            plan.setBreakfast(parseStringArray(planNode.get("breakfast")));
            plan.setLunch(parseStringArray(planNode.get("lunch")));
            plan.setDinner(parseStringArray(planNode.get("dinner")));
            plan.setGrocery(parseGrocery(planNode.get("grocery")));
            plan.setWeeklyPlan(parseStringArray(planNode.get("weeklyPlan")));
            plan.setWaterIntake(planNode.path("waterIntake").asText("—"));
            plan.setDoctorTips(parseStringArray(planNode.get("doctorTips")));

            return plan;
        } catch (Exception e) {
            log.error("Failed to generate smart diet plan via OpenAI.", e);
            return fallbackPlan();
        }
    }

    public SmartBudgetResponse generateSmartBudgetPlan(String input, int budget, String duration) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            log.warn("OpenAI API key is missing. Returning fallback smart budget response.");
            return fallbackBudget();
        }

        String systemPrompt = "You are a grocery + meal planning assistant. Return ONLY valid JSON. No markdown. No extra keys.";
        String userPrompt = ""
                + "Create a budget meal plan with grocery list.\n"
                + "User input: " + (input == null ? "" : input.trim()) + "\n"
                + "Budget: " + budget + " INR\n"
                + "Duration: " + (duration == null ? "" : duration.trim()) + "\n\n"
                + "Return STRICT JSON with EXACT keys:\n"
                + "{\n"
                + "  \"dayWiseMealPlan\": [\"string\"],\n"
                + "  \"grocery\": [{\"name\":\"string\",\"qty\":\"string\"}],\n"
                + "  \"totalCostPerDay\": 0,\n"
                + "  \"duration\": \"string\"\n"
                + "}\n";

        try {
            JsonNode node = callOpenAIJsonObject(systemPrompt, userPrompt, 900);
            SmartBudgetResponse r = new SmartBudgetResponse();
            r.setDayWiseMealPlan(parseStringArray(node.get("dayWiseMealPlan")));
            r.setGrocery(parseGrocery(node.get("grocery")));
            r.setTotalCostPerDay(node.path("totalCostPerDay").asDouble(0.0));
            r.setDuration(node.path("duration").asText(duration));
            return r;
        } catch (Exception e) {
            log.error("Failed to generate smart budget plan via OpenAI.", e);
            return fallbackBudget();
        }
    }

    public SmartRecipeResponse generateSmartRecipe(String recipeName, int members) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            log.warn("OpenAI API key is missing. Returning fallback smart recipe response.");
            return fallbackRecipe(recipeName, members);
        }

        String systemPrompt = "You are a cooking assistant for beginners. Return ONLY valid JSON. No markdown. No extra keys.";
        String userPrompt = ""
                + "Generate grocery list and step-by-step instructions for recipe.\n"
                + "Recipe: " + (recipeName == null ? "" : recipeName.trim()) + "\n"
                + "Members: " + members + "\n\n"
                + "Return STRICT JSON with EXACT keys:\n"
                + "{\n"
                + "  \"recipeName\": \"string\",\n"
                + "  \"members\": 0,\n"
                + "  \"imageUrl\": \"string\",\n"
                + "  \"grocery\": [{\"name\":\"string\",\"qty\":\"string\"}],\n"
                + "  \"steps\": [\"string\"]\n"
                + "}\n"
                + "Rules:\n"
                + "- steps must be clear and beginner-friendly.\n";

        try {
            JsonNode node = callOpenAIJsonObject(systemPrompt, userPrompt, 1200);
            SmartRecipeResponse r = new SmartRecipeResponse();
            r.setRecipeName(node.path("recipeName").asText(recipeName));
            r.setMembers(node.path("members").asInt(members));
            r.setImageUrl(node.path("imageUrl").asText("https://via.placeholder.com/600x360?text=Recipe"));
            r.setGrocery(parseGrocery(node.get("grocery")));
            r.setSteps(parseSteps(node.get("steps")));
            return r;
        } catch (Exception e) {
            log.error("Failed to generate smart recipe via OpenAI.", e);
            return fallbackRecipe(recipeName, members);
        }
    }

    public SmartHealthResponse generateSmartHealth(String condition, String input) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            log.warn("OpenAI API key is missing. Returning fallback smart health response.");
            return fallbackHealth(condition);
        }

        String systemPrompt = "You are a health-focused grocery assistant. Return ONLY valid JSON. No markdown. No extra keys.";
        String userPrompt = ""
                + "Health condition: " + (condition == null ? "" : condition.trim()) + "\n"
                + "User input: " + (input == null ? "" : input.trim()) + "\n\n"
                + "Return STRICT JSON with EXACT keys:\n"
                + "{\n"
                + "  \"condition\": \"string\",\n"
                + "  \"foodsToEat\": [\"string\"],\n"
                + "  \"foodsToAvoid\": [\"string\"],\n"
                + "  \"reasons\": [\"string\"],\n"
                + "  \"weeklyPlan\": [\"string\"]\n"
                + "}\n";

        try {
            JsonNode node = callOpenAIJsonObject(systemPrompt, userPrompt, 900);
            SmartHealthResponse r = new SmartHealthResponse();
            r.setCondition(node.path("condition").asText(condition));
            r.setFoodsToEat(parseStringArray(node.get("foodsToEat")));
            r.setFoodsToAvoid(parseStringArray(node.get("foodsToAvoid")));
            r.setReasons(parseStringArray(node.get("reasons")));
            r.setWeeklyPlan(parseStringArray(node.get("weeklyPlan")));
            return r;
        } catch (Exception e) {
            log.error("Failed to generate smart health response via OpenAI.", e);
            return fallbackHealth(condition);
        }
    }
}

