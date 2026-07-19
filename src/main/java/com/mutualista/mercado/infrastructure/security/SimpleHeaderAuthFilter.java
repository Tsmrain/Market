package com.mutualista.mercado.infrastructure.security;

import com.mutualista.mercado.domain.TokenSesion;
import com.mutualista.mercado.domain.Cliente;
import com.mutualista.mercado.domain.Comerciante;
import com.mutualista.mercado.domain.AdministradorAsociacion;
import com.mutualista.mercado.domain.repository.ClienteRepository;
import com.mutualista.mercado.domain.repository.ComercianteRepository;
import com.mutualista.mercado.domain.repository.AdministradorAsociacionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Component
public class SimpleHeaderAuthFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final ClienteRepository clienteRepo;
    private final ComercianteRepository comercianteRepo;
    private final AdministradorAsociacionRepository adminRepo;
    private final MessageSource messageSource;

    public SimpleHeaderAuthFilter(TokenProvider tokenProvider,
                                  ClienteRepository clienteRepo,
                                  ComercianteRepository comercianteRepo,
                                  AdministradorAsociacionRepository adminRepo,
                                  MessageSource messageSource) {
        this.tokenProvider = tokenProvider;
        this.clienteRepo = clienteRepo;
        this.comercianteRepo = comercianteRepo;
        this.adminRepo = adminRepo;
        this.messageSource = messageSource;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Eximir rutas públicas críticas del filtro de tokens
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            Optional<TokenSesion> sessionOpt = tokenProvider.validarToken(token);

            if (sessionOpt.isPresent()) {
                TokenSesion session = sessionOpt.get();
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + session.getRol()));

                // Cargar nombre del actor para polimorfismo de roles
                String nombre = "Usuario";
                if ("SUPERADMIN".equals(session.getRol()) || "ADMIN_ASOCIACION".equals(session.getRol())) {
                    Optional<AdministradorAsociacion> admin = adminRepo.findByUsuarioId(session.getUserId());
                    if (admin.isPresent()) nombre = admin.get().getNombre();
                } else if ("COMERCIANTE".equals(session.getRol())) {
                    Optional<Comerciante> merchant = comercianteRepo.findByUsuarioId(session.getUserId());
                    if (merchant.isPresent()) nombre = merchant.get().getNombre();
                } else {
                    Optional<Cliente> client = clienteRepo.findByUsuarioId(session.getUserId());
                    if (client.isPresent()) nombre = client.get().getNombre();
                }

                Map<String, String> principal = new HashMap<>();
                principal.put("id", session.getUserId().toString());
                principal.put("rol", session.getRol());
                principal.put("nombre", nombre);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null, authorities
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                // Si el token es inválido o expiró, verificar si la ruta es pública
                boolean isPublic = request.getMethod().equalsIgnoreCase("GET") &&
                                   (path.startsWith("/api/portal/") || path.startsWith("/api/productos/") || path.startsWith("/api/admin/categorias/"));

                if (!isPublic) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    String errorMsg = messageSource.getMessage("session.expired", null, LocaleContextHolder.getLocale());
                    response.getWriter().write("{\"error\": \"" + errorMsg + "\"}");
                    return;
                }
            }
        } else {
            // Retrocompatibilidad con tests u otros flujos directos (ej. llamadas internas del seed / cli)
            String userIdStr = request.getHeader("X-User-Id");
            if (userIdStr != null && !userIdStr.trim().isEmpty()) {
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_CLIENTE"));

                Map<String, String> principal = new HashMap<>();
                principal.put("id", userIdStr);
                principal.put("rol", "CLIENTE");

                Optional<Cliente> client = clienteRepo.findById(Long.parseLong(userIdStr));
                String nombre = client.isPresent() ? client.get().getNombre() : "Usuario Test";
                principal.put("nombre", nombre);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null, authorities
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}
