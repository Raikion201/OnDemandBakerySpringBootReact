package com.ecspring.services;

import com.ecspring.dto.ChatResponseDto;

public interface OllamaService {
    ChatResponseDto chat(String message, String context);
}
