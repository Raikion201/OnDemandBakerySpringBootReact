# 🤖 HƯỚNG DẪN TÍCH HỢP AI CHATBOT VỚI OLLAMA

## 📋 MỤC LỤC
1. [Cài đặt Ollama](#1-cài-đặt-ollama)
2. [Tạo Backend API](#2-tạo-backend-api)
3. [Tạo Frontend Chatbot](#3-tạo-frontend-chatbot)
4. [Test & Deploy](#4-test--deploy)

---

## 1. CÀI ĐẶT OLLAMA

### Bước 1.1: Download và cài đặt Ollama

**Cách 1: Download từ trang chính thức**
```
https://ollama.com/download/windows
```
- Tải file `OllamaSetup.exe`
- Chạy file để cài đặt
- Ollama sẽ tự động chạy ở background

**Cách 2: Dùng winget (nếu có)**
```powershell
winget install Ollama.Ollama
```

### Bước 1.2: Kiểm tra Ollama đã cài đặt

```powershell
ollama --version
```

### Bước 1.3: Pull model AI (chọn 1 trong các model sau)

**Llama 3.2 (3B) - Nhẹ, nhanh, phù hợp cho laptop:**
```powershell
ollama pull llama3.2:3b
```

**Llama 3.2 (1B) - Siêu nhẹ, phù hợp cho máy yếu:**
```powershell
ollama pull llama3.2:1b
```

**Gemma 2 (2B) - Google's model, cân bằng:**
```powershell
ollama pull gemma2:2b
```

**Đợi model download xong (khoảng 2-5 phút tùy model)**

### Bước 1.4: Test Ollama

```powershell
# Test model
ollama run llama3.2:3b "Hello, introduce yourself"

# Kiểm tra Ollama API
curl http://localhost:11434/api/generate -d "{\"model\": \"llama3.2:3b\", \"prompt\": \"Hello\"}"
```

✅ **Nếu thấy response → Ollama đã sẵn sàng!**

---

## 2. TẠO BACKEND API

### Bước 2.1: Tạo DTO Classes

**File: `ecspring/src/main/java/com/ecspring/dto/ChatMessageDto.java`**

```java
package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String message;
    private String sender; // "user" or "bot"
    private Long timestamp;
}
```

**File: `ecspring/src/main/java/com/ecspring/dto/ChatRequestDto.java`**

```java
package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDto {
    private String message;
    private String context; // Optional: conversation history
}
```

**File: `ecspring/src/main/java/com/ecspring/dto/ChatResponseDto.java`**

```java
package com.ecspring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String response;
    private Long timestamp;
}
```

### Bước 2.2: Tạo Ollama Service

**File: `ecspring/src/main/java/com/ecspring/services/OllamaService.java`**

```java
package com.ecspring.services;

import com.ecspring.dto.ChatResponseDto;

public interface OllamaService {
    ChatResponseDto chat(String message, String context);
}
```

**File: `ecspring/src/main/java/com/ecspring/services/impl/OllamaServiceImpl.java`**

```java
package com.ecspring.services.impl;

import com.ecspring.dto.ChatResponseDto;
import com.ecspring.services.OllamaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaServiceImpl implements OllamaService {

    @Value("${ollama.api.url:http://localhost:11434}")
    private String ollamaApiUrl;

    @Value("${ollama.model:llama3.2:3b}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public ChatResponseDto chat(String message, String context) {
        try {
            // Build system prompt for bakery context
            String systemPrompt = buildSystemPrompt();
            
            // Combine system prompt with user message
            String fullPrompt = systemPrompt + "\n\nCustomer: " + message + "\n\nAssistant:";
            
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

    private String buildSystemPrompt() {
        return """
            You are a friendly and helpful AI assistant for BakeDelights, an online bakery.
            
            Your role:
            - Help customers find the perfect baked goods
            - Answer questions about products, ingredients, and ordering
            - Provide baking tips and recommendations
            - Be warm, friendly, and enthusiastic about baking
            
            Our products include:
            - Croissants and pastries
            - Breads (sourdough, baguettes, whole wheat)
            - Cakes and cupcakes
            - Cookies and biscotti
            - Custom orders for special occasions
            
            Keep responses concise (2-3 sentences) and helpful.
            If asked about specific products, encourage them to browse our Products page.
            """;
    }
}
```

### Bước 2.3: Tạo Controller

**File: `ecspring/src/main/java/com/ecspring/controllers/ChatController.java`**

```java
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
```

### Bước 2.4: Cập nhật Security Config

**Thêm vào `SpringSecurity.java` (line 99):**

```java
.requestMatchers("/api/chat/**").permitAll()
```

### Bước 2.5: Cập nhật application.yaml

**Thêm vào `ecspring/src/main/resources/application.yaml`:**

```yaml
# Ollama Configuration
ollama:
  api:
    url: ${OLLAMA_API_URL:http://localhost:11434}
  model: ${OLLAMA_MODEL:llama3.2:3b}
```

---

## 3. TẠO FRONTEND CHATBOT

### Bước 3.1: Tạo Chatbot Component

**File: `ecfront/ec-front/components/chat/Chatbot.tsx`**

```typescript
"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import axios from '@/lib/axiosConfig';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your BakeDelights assistant. How can I help you today?", sender: 'bot', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: input,
        context: messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n')
      });

      const botMessage: Message = {
        text: response.data.response,
        sender: 'bot',
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        text: "Sorry, I'm having trouble right now. Please try again!",
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all z-50 flex items-center justify-center"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">BakeDelights Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary/80 rounded p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Bước 3.2: Thêm Chatbot vào Layout

**Sửa file: `ecfront/ec-front/app/layout.tsx`**

Thêm import:
```typescript
import { Chatbot } from "@/components/chat/Chatbot";
```

Thêm component vào body (trước </body>):
```typescript
<Chatbot />
```

---

## 4. TEST & DEPLOY

### Bước 4.1: Test Ollama

```powershell
# Kiểm tra Ollama đang chạy
ollama list

# Test model
ollama run llama3.2:3b "What bakery products do you recommend?"
```

### Bước 4.2: Restart Backend

```powershell
cd ecspring
.\mvnw.cmd spring-boot:run
```

### Bước 4.3: Frontend đã tự động reload

Mở browser: http://localhost:3000

✅ **Bạn sẽ thấy icon chatbot ở góc dưới bên phải!**

---

## 🎯 TESTING CHATBOT

**Câu hỏi test:**
1. "What products do you sell?"
2. "Tell me about your croissants"
3. "Do you have gluten-free options?"
4. "How can I place an order?"
5. "What are your best sellers?"

---

## 🔧 TROUBLESHOOTING

**Lỗi: Cannot connect to Ollama**
- Kiểm tra Ollama đang chạy: `ollama list`
- Restart Ollama: Mở Task Manager → Find "Ollama" → End task → Mở lại Ollama

**Lỗi: Model not found**
- Pull model lại: `ollama pull llama3.2:3b`

**Response chậm**
- Dùng model nhẹ hơn: `llama3.2:1b` hoặc `gemma2:2b`

---

## 📝 NOTES

- Ollama chạy trên port **11434**
- Model được cache tại: `C:\Users\{username}\.ollama\models`
- RAM usage: ~2-4GB tùy model
- First response có thể chậm (loading model vào RAM)

**🎉 DONE! Bạn đã có AI Chatbot chạy hoàn toàn local!**

