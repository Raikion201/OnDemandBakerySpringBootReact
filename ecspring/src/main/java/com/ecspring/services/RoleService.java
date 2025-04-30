package com.ecspring.services;

import com.ecspring.dto.RoleDto;
import com.ecspring.entity.RoleEntity;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleService {
    List<RoleEntity> getAllRoles();
    List<RoleDto> getAllRoleDtos();
    Optional<RoleEntity> findByName(String name);
    List<RoleEntity> findRolesByNames(Set<String> roleNames);
}
