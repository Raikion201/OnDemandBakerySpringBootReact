package com.ecspring;

import com.ecspring.dto.RegisterDto;
import com.ecspring.entity.UserEntity;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EcspringApplicationTests {

    @Test
    void contextLoads() {
        RegisterDto userDto = new RegisterDto();
        String test = userDto.getUsername();
    }

}
