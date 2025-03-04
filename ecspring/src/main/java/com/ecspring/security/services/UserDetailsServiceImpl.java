package com.ecspring.security.services;

import com.ecspring.entity.UserEntity;
import com.ecspring.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;




@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
        public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
            UserEntity user;
            if (loginId.contains("@")) {
                user = userRepository.findByEmail(loginId);
                if(user == null){
                    user = userRepository.findByUsername(loginId);
                }
            } else {
                user = userRepository.findByUsername(loginId);
            }

            if (user != null) {
                return UserDetailsImpl.build(user);
            }else{
                throw new UsernameNotFoundException("Invalid username or password.");
            }
        }

    }

