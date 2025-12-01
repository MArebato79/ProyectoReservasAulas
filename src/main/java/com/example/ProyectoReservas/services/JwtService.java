package com.example.ProyectoReservas.services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Constructor simple (sin @Value)
    public JwtService() {
        // La clave ya está inicializada arriba
    }

    // Genera un token JWT para un usuario autenticado
    public String generateToken(Authentication authentication) {
        // Extraer los roles del usuario
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        // Construir el token JWT
        return Jwts.builder()
                .subject(authentication.getName())
                .issuer("gestion-centro-api")
                .issuedAt(new Date())
                .expiration(new Date(
                        System.currentTimeMillis() + 86400000 // Expira en 24h
                ))
                .claim("roles", roles)
                .signWith(secretKey) // Usa la clave volátil
                .compact();
    }

    public SecretKey getSecretKey() {
        return secretKey;
    }
}

