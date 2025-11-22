# Feature: Authentication System

## Overview

Secure authentication system providing admin access to content management features using JWT tokens stored in HTTP-only cookies, with bcrypt password hashing and session management.

## Purpose

Protect admin functionality from unauthorized access while providing a smooth, secure login experience for portfolio administrators.

## Target Users

### Primary: Portfolio Owner (Admin)
- Logging in to access admin panel
- Managing authentication sessions
- Securely accessing content management features

## Key Capabilities

### 1. User Authentication

**Login Flow:**
- Email and password authentication
- JWT token generation
- HTTP-only cookie storage
- Session persistence (7 days)
- Automatic token refresh (future)

**Security Features:**
- bcrypt password hashing (10+ rounds)
- HTTP-only cookies (XSS prevention)
- Secure flag in production (HTTPS only)
- SameSite=Strict (CSRF prevention)
- Token expiration (7 days)

### 2. Session Management

**Active Sessions:**
- Persistent login across browser tabs
- Session validation on each request
- Automatic session extension
- Manual logout capability
- Session timeout after inactivity

**Token Validation:**
- Verify token signature
- Check token expiration
- Validate user exists
- Confirm admin role
- Reject invalid/expired tokens

### 3. Protected Routes

**Frontend Protection:**
- Redirect unauthenticated users to login
- Preserve intended destination
- Show loading state during auth check
- Clear UI feedback on auth status

**Backend Protection:**
- Middleware on all admin endpoints
- JWT token extraction from cookies
- Role-based authorization
- Consistent error responses

### 4. User Management (Admin)

**Current Implementation:**
- Single admin user
- Manual user creation via database/seed
- Password reset via database (future: email reset)

**Future Enhancements:**
- Multiple admin users
- User roles (admin, editor, viewer)
- Self-service password reset
- Account settings page
- Login history tracking

## User Flows

### Admin Login

1. Navigate to `/login`
2. Enter email and password
3. Click "Login" button
4. System validates credentials:
   - Finds user by email
   - Verifies password with bcrypt
   - Generates JWT token
   - Sets HTTP-only cookie
5. Redirect to admin dashboard (or intended destination)
6. Access admin features

### Failed Login Attempt

1. Navigate to `/login`
2. Enter incorrect email or password
3. Click "Login" button
4. System validates and fails:
   - User not found OR password mismatch
   - Returns generic "Invalid credentials" error (security best practice)
5. Show error message
6. Allow retry

### Admin Session Active

1. User already logged in (has valid token)
2. Navigate to any admin page
3. System validates token on each request:
   - Extract token from cookie
   - Verify signature and expiration
   - Confirm user still exists and is admin
4. Grant access to protected resources
5. Session remains active until logout or expiration

### Admin Logout

1. User clicks "Logout" in admin panel
2. System clears auth cookie
3. Redirect to login page or homepage
4. Cannot access admin routes without re-authentication

### Expired Session

1. User returns after 7+ days
2. Token has expired
3. Attempt to access admin page
4. System rejects expired token
5. Redirect to login page
6. Show message: "Your session has expired. Please log in again."

## Security Architecture

### Password Security

**Hashing:**
- Algorithm: bcrypt
- Cost factor: 10-12 rounds
- Salting: Automatic per password
- Verification: Constant-time comparison

**Best Practices:**
- Never store plaintext passwords
- Never log passwords
- Never return passwords in API responses
- Require strong passwords (future: validation)

### Token Security

**JWT Structure:**
```json
{
  "userId": "cuid",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1732156800,
  "exp": 1732761600
}
```

**Storage:**
- Location: HTTP-only cookie named `auth-token`
- Flags: HttpOnly, Secure (prod), SameSite=Strict
- Domain: Same domain as application
- Path: `/` (all routes)
- Max-Age: 7 days (604800 seconds)

**Why HTTP-only Cookies:**
- Cannot be accessed by JavaScript (XSS protection)
- Automatically sent with requests
- Browser handles storage security
- Simpler than localStorage + manual header management

### Authorization Middleware

**Backend Middleware Flow:**
1. Extract token from request cookies
2. Verify JWT signature
3. Check token expiration
4. Decode token payload
5. Verify user exists in database
6. Confirm user role is ADMIN
7. Attach user info to request
8. Allow request to proceed OR return 401/403

**Frontend Auth Context:**
1. Check for existing session on app load
2. Call `/api/auth/session` endpoint
3. Store auth state in React Context
4. Provide login/logout functions
5. Protect routes with auth checks
6. Redirect unauthenticated users

## API Endpoints

### POST /api/auth/login
**Purpose:** Authenticate user and create session
**Input:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```
**Output:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Side Effect:** Sets `auth-token` HTTP-only cookie

### GET /api/auth/session
**Purpose:** Verify current session and return user info
**Auth Required:** Yes (JWT in cookie)
**Output:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

### POST /api/auth/logout
**Purpose:** Clear authentication session
**Auth Required:** Yes (JWT in cookie)
**Output:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```
**Side Effect:** Clears `auth-token` cookie

## Error Handling

**Common Auth Errors:**

| Error | Status | Message | Cause |
|-------|--------|---------|-------|
| Invalid credentials | 401 | "Invalid credentials" | Wrong email or password |
| Token missing | 401 | "Authentication required" | No token in request |
| Token expired | 401 | "Session expired" | Token past expiration |
| Token invalid | 401 | "Invalid authentication token" | Malformed or tampered token |
| Insufficient permissions | 403 | "Admin access required" | User is not admin role |
| User not found | 401 | "Invalid credentials" | User deleted after token issued |

## Design Principles

1. **Security First:** Protect against common vulnerabilities (XSS, CSRF, brute force)
2. **User-Friendly:** Clear error messages, smooth login flow
3. **Stateless:** JWT allows serverless architecture
4. **Standard Practices:** Industry-standard bcrypt + JWT
5. **Future-Proof:** Extensible to multiple users and roles

## Future Enhancements

### Short-Term (Phase 2)
- Password reset via email
- "Remember me" option (longer sessions)
- Login rate limiting
- Account lockout after failed attempts

### Medium-Term (Phase 3)
- Multiple admin users
- User roles (admin, editor, viewer)
- Account settings page
- Password change functionality
- Login history tracking

### Long-Term (Phase 4)
- Two-factor authentication (2FA)
- Social login (Google, GitHub)
- API key authentication
- Refresh tokens
- Device management

## Related Documentation

- **Admin Panel:** [admin-panel.md](./admin-panel.md) - Features requiring authentication
- **Spec:** [03-how/specs/authentication.spec.md](../../03-how/specs/authentication.spec.md) - Detailed requirements
- **Implementation:** [03-how/implementation/authentication.impl.md](../../03-how/implementation/authentication.impl.md) - Technical details
- **ADR:** [03-how/architecture/ADR-003-jwt-cookies.md](../../03-how/architecture/ADR-003-jwt-cookies.md) - Why JWT + cookies

---

**Feature Type:** Security & Access Control
**Status:** Implemented
**Last Updated:** 2025-11-21
