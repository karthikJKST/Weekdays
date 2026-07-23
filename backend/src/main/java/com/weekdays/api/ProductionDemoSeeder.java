package com.weekdays.api;

import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRepository;
import com.weekdays.api.user.UserRole;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("production")
public class ProductionDemoSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductionDemoSeeder.class);

    private static final String DEMO_EMAIL = "demo@weekdays.dev";
    private static final String DEMO_PASSWORD = "Demo@123";
    private static final String DEMO_NAME = "Demo User";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProductionDemoSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmailIgnoreCase(DEMO_EMAIL).isPresent()) {
            log.info("Demo account already exists — skipping.");
            return;
        }

        User demo = new User(
                UUID.randomUUID(),
                DEMO_NAME,
                DEMO_EMAIL,
                passwordEncoder.encode(DEMO_PASSWORD),
                UserRole.OWNER
        );
        userRepository.save(demo);

        log.info("Demo account created successfully. Email: {} / Password: {}", DEMO_EMAIL, DEMO_PASSWORD);
    }
}
