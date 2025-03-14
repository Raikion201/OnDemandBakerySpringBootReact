package com.ecspring.services;

import org.springframework.security.core.Authentication;

import com.ecspring.dto.OAuthUserRegisterDto;
import com.ecspring.entity.UserEntity;

import jakarta.servlet.http.HttpServletResponse;

public interface OAuthUserService {
    Authentication processOAuthUser(OAuthUserRegisterDto oAuthUserRegisterDto);

    UserEntity createNewOAuthUser(OAuthUserRegisterDto oAuthUserRegisterDto);
}
