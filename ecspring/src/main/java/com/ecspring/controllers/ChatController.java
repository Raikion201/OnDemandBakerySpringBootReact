package com.ecspring.controllers;

import com.ecspring.dto.ChatRequestDto;
import com.ecspring.dto.ChatResponseDto;
import com.ecspring.services.OllamaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private OllamaService ollamaService;

    @PostMapping
    public ResponseEntity<ChatResponseDto> chat(@RequestBody ChatRequestDto request) {
        try {
            ChatResponseDto response = ollamaService.chat(request.getMessage(), request.getContext());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ChatResponseDto("Error processing request", System.currentTimeMillis()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running");
    }
}
