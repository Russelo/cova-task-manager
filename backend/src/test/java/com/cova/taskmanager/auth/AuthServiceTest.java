package com.cova.taskmanager.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.cova.taskmanager.security.JwtService;
import com.cova.taskmanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService() {
        return new AuthService(userRepository, passwordEncoder, authenticationManager, jwtService);
    }

    @Test
    void register_createsUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("Alice", "Dupont", "alice@cova.dev", "password123", "password123");
        when(userRepository.existsByEmail("alice@cova.dev")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(jwtService.generateToken("alice@cova.dev")).thenReturn("jwt-token");

        AuthResponse response = authService().register(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        verify(userRepository).save(argThat(user ->
                user.getFirstName().equals("Alice")
                        && user.getLastName().equals("Dupont")
                        && user.getEmail().equals("alice@cova.dev")
                        && user.getPassword().equals("hashed-password")));
    }

    @Test
    void register_rejectsMismatchedPasswords() {
        RegisterRequest request = new RegisterRequest("Alice", "Dupont", "alice@cova.dev", "password123", "different");

        assertThatThrownBy(() -> authService().register(request))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        verifyNoInteractions(userRepository);
    }

    @Test
    void register_rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Alice", "Dupont", "alice@cova.dev", "password123", "password123");
        when(userRepository.existsByEmail("alice@cova.dev")).thenReturn(true);

        assertThatThrownBy(() -> authService().register(request))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void login_returnsTokenOnValidCredentials() {
        LoginRequest request = new LoginRequest("alice@cova.dev", "password123");
        when(jwtService.generateToken("alice@cova.dev")).thenReturn("jwt-token");

        AuthResponse response = authService().login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void login_rejectsBadCredentials() {
        LoginRequest request = new LoginRequest("alice@cova.dev", "wrong-password");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService().login(request))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }
}
