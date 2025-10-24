package org.dubini.frontend_api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtProvider {
    private final String secretKey = "y2XNO0zZrO6Aj1DdYqJ9GgYMKqUUVH2I3smKckddO0TL9vRQwrVChD3GpAnlz3vkeRHK+4tYvnwRyaqRaS/N4A==";
    private final long jwtExpiration = 86_400_000L;

    private final SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));

    public String generateToken() {
        String token = Jwts.builder()
                .setSubject("backoffice")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key)
                .compact();
       
        return token;
    }

     public boolean validateToken(String token) {
        try {  
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            String subject = claims.getSubject();
            Date expiration = claims.getExpiration();
            Date now = new Date();

            boolean isValid = "backoffice".equals(subject) && expiration.after(now);
            return isValid;
        } catch (Exception e) {
            return false;
        }
    }
}