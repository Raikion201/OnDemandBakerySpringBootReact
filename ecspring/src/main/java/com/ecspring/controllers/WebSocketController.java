package com.ecspring.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.security.Principal;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/notification")
    @SendTo("/topic/notifications")
    public String handleNotification(String message) {
        return "Echo: " + message;
    }

    @MessageMapping("/order.status")
    @SendTo("/topic/orders")
    public String handleOrderStatusUpdate(String orderData) {
        return "Order status updated: " + orderData;
    }
}

