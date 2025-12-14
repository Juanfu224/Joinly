package com.alberti.joinly;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
	"spring.flyway.enabled=false",
	"spring.jpa.hibernate.ddl-auto=create-drop",
	"cors.allowed-origins=http://localhost:4200",
	"cors.allowed-methods=GET,POST,PUT,DELETE",
	"cors.allowed-headers=*",
	"cors.exposed-headers=Authorization",
	"cors.max-age=3600"
})
@Disabled("Requiere configuración adicional para Spring Boot 4 - Test de contexto completo")
class JoinlyApplicationTests {

	@Test
	void contextLoads() {
	}

}
