package com.kuizu.backend.config;

import com.kuizu.backend.entity.UserSession;
import com.kuizu.backend.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SessionAuthenticationFilter.class);

    private final SessionService sessionService;
    private final UserDetailsService userDetailsService;

    public SessionAuthenticationFilter(SessionService sessionService, UserDetailsService userDetailsService) {
        this.sessionService = sessionService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String sessionToken;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        sessionToken = authHeader.substring(7).trim();
        logger.debug("Attempting to authenticate with session token: '{}'", sessionToken);
        Optional<UserSession> sessionOpt = sessionService.getSession(sessionToken);

        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            String username = session.getUser().getUsername();
            logger.debug("Session found for user: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                if (userDetails.isEnabled() && userDetails.isAccountNonLocked()) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set for user: {}", username);

                    // Update last active
                    sessionService.updateActive(session);
                } else {
                    logger.warn("User {} is disabled or locked. Revoking session.", username);
                    sessionService.revokeSession(sessionToken);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Account is suspended or locked\"}");
                    return;
                }
            }
        } else {
            logger.warn("No active session found for token: {}", sessionToken);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Session expired or invalid\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
