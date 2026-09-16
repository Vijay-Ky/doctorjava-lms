package com.doctorjava.lms.core.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Helpers for ownership / IDOR checks.
 * Admins and Super-Admins may access any resource; others only their own.
 */
public final class SecurityUtils {
    private SecurityUtils() {}

    public static UserPrincipal requirePrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return principal;
    }

    public static UUID currentUserId() {
        return requirePrincipal().getId();
    }

    public static boolean isSuperAdmin() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null) return false;
        return a.getAuthorities().stream().anyMatch(x -> "ROLE_SUPER_ADMIN".equals(x.getAuthority()));
    }

    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            String r = a.getAuthority();
            if ("ROLE_ADMIN".equals(r) || "ROLE_SUPER_ADMIN".equals(r)
                    || "ADMIN".equals(r) || "SUPER_ADMIN".equals(r)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Throws 403 unless the authenticated user owns the resource or is admin.
     */
    public static void requireOwnerOrAdmin(UUID resourceOwnerId) {
        if (resourceOwnerId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (isAdmin()) return;
        UUID me = currentUserId();
        if (!me.equals(resourceOwnerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    /** Force userId to the authenticated principal unless admin is impersonating (not allowed by default). */
    public static UUID resolveUserId(UUID requestedUserId) {
        if (isAdmin() && requestedUserId != null) {
            return requestedUserId;
        }
        return currentUserId();
    }
}
