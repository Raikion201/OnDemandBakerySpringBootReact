package com.ecspring.security.oauth2;

import com.ecspring.dto.OAuthUserRegisterDto;
import com.ecspring.services.OAuthUserService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();


    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = delegate.loadUser(userRequest);
        
        
        Map<String, Object> attributes = oAuth2User.getAttributes();
//        String email = (String) attributes.get("email");
//        String name = (String) attributes.get("name");
        
        // Create DTO
//        OAuthUserRegisterDto oAuthUserDto = new OAuthUserRegisterDto();
//        oAuthUserDto.setEmail(email);
//        oAuthUserDto.setName(name);
        
//        Authentication authentication = oAuthUserService.processOAuthUser(oAuthUserDto);

        // Create the OAuth2User with the authorities and attributes
        return new DefaultOAuth2User(
                null,
                attributes,
                "email" // Use email as the name attribute key
        );
    }
}