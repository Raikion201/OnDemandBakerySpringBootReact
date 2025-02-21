package com.ecspring;

import com.ecspring.dto.UserDto;
import com.ecspring.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EcspringApplicationTests {

    @Test
    void contextLoads() {
        UserDto userDto = new UserDto();
        String test = userDto.getUsername();
    }

}
