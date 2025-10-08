package com.ecspring.services.impl;

import com.ecspring.dto.ChatResponseDto;
import com.ecspring.entity.ProductEntity;
import com.ecspring.services.OllamaService;
import com.ecspring.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OllamaServiceImpl implements OllamaService {

    @Value("${ollama.api.url:http://localhost:11434}")
    private String ollamaApiUrl;

    @Value("${ollama.model:gemma3:4b}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Autowired
    private ProductService productService;

    @Override
    public ChatResponseDto chat(String message, String context) {
        try {
            // Build system prompt for bakery context
            String systemPrompt = buildSystemPrompt();
            
            // Check if message is asking about products and fetch relevant data
            String productContext = "";
            if (isProductRelatedQuery(message)) {
                productContext = fetchProductContext(message);
            }
            
            // Combine all context
            String fullPrompt = systemPrompt;
            if (!productContext.isEmpty()) {
                fullPrompt += "\n\n" + productContext;
            }
            fullPrompt += "\n\nCustomer: " + message + "\n\nAssistant:";
            
            // Prepare request to Ollama
            Map<String, Object> request = new HashMap<>();
            request.put("model", model);
            request.put("prompt", fullPrompt);
            request.put("stream", false);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // Call Ollama API
            String url = ollamaApiUrl + "/api/generate";
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            String botResponse = response != null ? (String) response.get("response") : "Sorry, I couldn't process that.";
            
            return new ChatResponseDto(botResponse.trim(), Instant.now().toEpochMilli());
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ChatResponseDto("Sorry, I'm having trouble connecting. Please try again later.", Instant.now().toEpochMilli());
        }
    }

    /**
     * Detect if the user query is related to products
     */
    private boolean isProductRelatedQuery(String message) {
        String lowerMessage = message.toLowerCase();
        String[] productKeywords = {
            "product", "products", "sell", "selling", "have", "available",
            "croissant", "bread", "cake", "cookie", "pastry", "biscotti",
            "price", "cost", "how much", "expensive", "cheap", "affordable",
            "show", "list", "what", "menu", "catalog", "inventory",
            "buy", "purchase", "order", "stock", "in stock"
        };
        
        for (String keyword : productKeywords) {
            if (lowerMessage.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Fetch relevant product data from database based on query
     */
    private String fetchProductContext(String message) {
        try {
            String lowerMessage = message.toLowerCase();
            List<ProductEntity> products;
            
            // Check for price-related queries
            if (lowerMessage.contains("under") || lowerMessage.contains("below") || 
                lowerMessage.contains("less than") || lowerMessage.contains("cheap")) {
                // Extract price if mentioned, otherwise default to $20
                Double maxPrice = extractPrice(message);
                if (maxPrice == null) maxPrice = 20.0;
                products = productService.getProductsByPriceRange(0.0, maxPrice);
            }
            // Check for specific product name searches
            else if (containsSpecificProductName(lowerMessage)) {
                String searchTerm = extractProductName(lowerMessage);
                products = productService.searchProductsByName(searchTerm);
            }
            // Default: get all products in stock
            else {
                products = productService.getProductsInStock();
                // Limit to first 10 to avoid overwhelming the AI
                if (products.size() > 10) {
                    products = products.subList(0, 10);
                }
            }
            
            if (products.isEmpty()) {
                return "CURRENT INVENTORY: No products found matching the query.";
            }
            
            return formatProductsForAI(products);
            
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
    
    /**
     * Check if message contains specific product names
     */
    private boolean containsSpecificProductName(String message) {
        String[] productTypes = {
            "croissant", "bread", "cake", "cookie", "pastry", 
            "biscotti", "baguette", "sourdough", "chocolate", "vanilla"
        };
        for (String type : productTypes) {
            if (message.contains(type)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Extract product name from message
     */
    private String extractProductName(String message) {
        String[] productTypes = {
            "croissant", "bread", "cake", "cookie", "pastry", 
            "biscotti", "baguette", "sourdough", "chocolate", "vanilla"
        };
        for (String type : productTypes) {
            if (message.contains(type)) {
                return type;
            }
        }
        return "";
    }
    
    /**
     * Extract price from message (simple implementation)
     */
    private Double extractPrice(String message) {
        try {
            // Look for patterns like "$10", "10 dollars", "10$"
            String[] words = message.split("\\s+");
            for (String word : words) {
                String cleaned = word.replaceAll("[^0-9.]", "");
                if (!cleaned.isEmpty()) {
                    return Double.parseDouble(cleaned);
                }
            }
        } catch (Exception e) {
            // Ignore parsing errors
        }
        return null;
    }
    
    /**
     * Format products data for AI context
     */
    private String formatProductsForAI(List<ProductEntity> products) {
        StringBuilder context = new StringBuilder();
        context.append("CURRENT INVENTORY (Real-time data from database):\n\n");
        
        for (ProductEntity product : products) {
            context.append(String.format(
                "- %s\n" +
                "  Price: $%.2f\n" +
                "  Description: %s\n" +
                "  Stock: %d units available\n\n",
                product.getName(),
                product.getPrice(),
                product.getDescription() != null ? product.getDescription() : "No description",
                product.getQuantity()
            ));
        }
        
        context.append("Note: Use this real inventory data to answer the customer's question accurately. ");
        context.append("Mention specific products, prices, and availability from the list above.");
        
        return context.toString();
    }

    private String buildSystemPrompt() {
        return """
            You are a friendly and helpful AI assistant for BakeDelights, an online bakery.
            
            Your role:
            - Help customers find the perfect baked goods
            - Answer questions about products, ingredients, and ordering based on REAL inventory data
            - Provide baking tips and recommendations
            - Be warm, friendly, and enthusiastic about baking
            
            IMPORTANT: When product inventory data is provided below, use it to give accurate answers about:
            - Available products and their names
            - Actual prices
            - Stock availability
            - Product descriptions
            
            Keep responses concise (2-3 sentences) but informative.
            Always mention specific product names and prices when available.
            """;
    }
}
