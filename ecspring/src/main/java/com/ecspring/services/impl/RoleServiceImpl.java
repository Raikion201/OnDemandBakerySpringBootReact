package com.ecspring.services.impl;

import com.ecspring.dto.RoleDto;
import com.ecspring.entity.RoleEntity;
import com.ecspring.repositories.RoleRepository;
import com.ecspring.services.RoleService;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    @Override
    public List<RoleEntity> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @Override
    public List<RoleDto> getAllRoleDtos() {
        List<RoleEntity> roles = roleRepository.findAll();
        return roles.stream()
                .map(this::mapToRoleDto)
                .collect(Collectors.toList());
    }
    
    private RoleDto mapToRoleDto(RoleEntity role) {
        return new RoleDto(role.getId(), role.getName());
    }
    
    @Override
    public Optional<RoleEntity> findByName(String name) {
        return Optional.ofNullable(roleRepository.findByName(name));
    }
    
    @Override
    public List<RoleEntity> findRolesByNames(Set<String> roleNames) {
        List<RoleEntity> roles = new ArrayList<>();
        for (String roleName : roleNames) {
            RoleEntity role = roleRepository.findByName(roleName);
            if (role != null) {
                roles.add(role);
            }
        }
        return roles;
    }
}
