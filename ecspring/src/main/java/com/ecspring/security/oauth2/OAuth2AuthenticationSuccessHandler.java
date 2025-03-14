package com.ecspring.security.oauth2;

import com.ecspring.dto.OAuthUserRegisterDto;
import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.UserRepository;
import com.ecspring.security.jwt.JwtUtil;
import com.ecspring.security.services.UserDetailsImpl;
import com.ecspring.services.OAuthUserService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final OAuthUserService oAuthUserService;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil,
            OAuthUserService oAuthUserService) {
        this.jwtUtil = jwtUtil;
        this.oAuthUserService = oAuthUserService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication OAuthAuthentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oauth2User = (OAuth2User) OAuthAuthentication.getPrincipal();

        Map<String, Object> attributes = oauth2User.getAttributes();
        // Access attributes from the map
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        OAuthUserRegisterDto oAuthUserDto = new OAuthUserRegisterDto();
        oAuthUserDto.setEmail(email);
        oAuthUserDto.setName(name);

        Authentication usernamePasswordAuthentication = oAuthUserService.processOAuthUser(oAuthUserDto);
        // Generate JWT tokens and set cookies
        jwtUtil.generateAndSetJwtTokens(response, usernamePasswordAuthentication);
        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthentication);

        // Redirect to frontend application
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/user");
    }

}
