package com.mutualista.mercado.infrastructure.security;

import com.mutualista.mercado.domain.TokenSesion;
import com.mutualista.mercado.domain.repository.TokenSesionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class TokenProvider {
    private final TokenSesionRepository tokenRepo;

    public TokenProvider(TokenSesionRepository tokenRepo) {
        this.tokenRepo = tokenRepo;
    }

    public String generarToken(Long userId, String rol) {
        LocalDateTime expiration;
        if ("SUPERADMIN".equals(rol)) {
            expiration = LocalDateTime.now().plusMinutes(30);
        } else if ("ADMIN_ASOCIACION".equals(rol)) {
            expiration = LocalDateTime.now().plusHours(8);
        } else {
            expiration = LocalDateTime.now().plusDays(30);
        }

        String tokenStr = UUID.randomUUID().toString();
        TokenSesion session = new TokenSesion(tokenStr, userId, rol, expiration);
        tokenRepo.save(session);
        return tokenStr;
    }

    public Optional<TokenSesion> validarToken(String token) {
        Optional<TokenSesion> opt = tokenRepo.findById(token);
        if (opt.isPresent()) {
            TokenSesion s = opt.get();
            if (s.getFechaExpiracion().isAfter(LocalDateTime.now())) {
                return Optional.of(s);
            } else {
                tokenRepo.delete(s);
            }
        }
        return Optional.empty();
    }
}
