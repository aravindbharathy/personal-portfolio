# ADR-003: JWT Tokens with HTTP-only Cookies for Authentication

**Status:** Accepted
**Date:** 2025-11-21
**Decision Makers:** Development Team
**Context Review Date:** 2026-11-21

## Context

We need an authentication mechanism for protecting admin routes and managing user sessions. The system must:

- Secure admin panel access
- Prevent unauthorized content modifications
- Persist sessions across browser sessions (7 days)
- Work seamlessly with serverless architecture
- Protect against common web vulnerabilities (XSS, CSRF)
- Support API and web browser clients

### Requirements

**Functional:**
- User login with email/password
- Session persistence (7 days)
- Logout capability
- Token validation on each request
- Role-based authorization (admin only)

**Non-Functional:**
- Secure against XSS attacks
- Secure against CSRF attacks
- Stateless (no server-side session storage)
- Fast validation (<50ms)
- Works with serverless functions
- Simple to implement and maintain

### Constraints

- Serverless deployment (no session storage server)
- Single-page application frontend
- RESTful API backend
- No third-party auth services (Auth0, Firebase)
- Team wants control over auth logic

## Decision

**We will use JWT (JSON Web Tokens) stored in HTTP-only cookies for authentication.**

### Implementation Details

**Token Type:** JWT (JSON Web Token)
**Storage:** HTTP-only cookies
**Algorithm:** HS256 (HMAC SHA-256)
**Token Lifetime:** 7 days
**Cookie Name:** `auth-token`

**JWT Payload:**
```json
{
  "userId": "clxyz123",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1732156800,
  "exp": 1732761600
}
```

**Cookie Configuration:**
```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,                              // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',                          // CSRF protection
  maxAge: 7 * 24 * 60 * 60,                   // 7 days in seconds
  path: '/',                                   // Available to all routes
});
```

**Authentication Flow:**
```typescript
// Login
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Verify credentials
  const user = await prisma.user.findUnique({ where: { email } });
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new UnauthorizedError('Invalid credentials');

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set HTTP-only cookie
  const response = NextResponse.json({ success: true, user });
  response.cookies.set('auth-token', token, { httpOnly: true, ... });

  return response;
}

// Protected Route
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) throw new UnauthorizedError();

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (user.role !== 'ADMIN') throw new ForbiddenError();

  // Proceed with protected logic
}
```

## Rationale

### Why JWT + HTTP-only Cookies

**JWT Benefits:**
1. **Stateless:** No server-side session storage needed (perfect for serverless)
2. **Self-Contained:** All user info in token (no DB lookup per request)
3. **Standard:** Well-established, many libraries available
4. **Efficient:** Fast to verify (just signature check)
5. **Scalable:** Works across multiple serverless instances

**HTTP-only Cookie Benefits:**
1. **XSS Protection:** JavaScript cannot access the token
2. **Automatic:** Browser sends cookie with every request
3. **Secure:** Can enforce HTTPS-only transmission
4. **CSRF Protection:** SameSite=Strict prevents cross-origin requests
5. **Browser-Managed:** No manual header management needed
6. **Mobile-Friendly:** Works in web views and PWAs

**Combined Advantages:**
- Best of both worlds: JWT's statelessness + cookie's security
- Simple implementation
- Industry best practice for SPAs
- Balances security and usability

### Comparison with Alternatives

#### vs. JWT in localStorage
**localStorage Advantages:**
- Simpler to access from JavaScript
- More explicit control

**Why HTTP-only Cookies Instead:**
- **Security:** localStorage vulnerable to XSS attacks
- **Best Practice:** Cookies designed for auth tokens
- **Automatic:** No manual header management
- **Safer:** Even if XSS exists, token cannot be stolen

#### vs. Session Cookies (Server-Side Sessions)
**Session Cookies Advantages:**
- Can revoke sessions immediately
- Simpler to implement invalidation
- No JWT complexities

**Why JWT + Cookies Instead:**
- **Stateless:** No session storage needed (critical for serverless)
- **Scalable:** No shared session store required
- **Performance:** No DB lookup per request
- **Cost:** No Redis/session store costs

#### vs. OAuth2 / OpenID Connect
**OAuth Advantages:**
- Industry standard for auth
- Social login support
- Delegation capabilities

**Why Not Chosen:**
- **Complexity:** Overkill for single admin user
- **Dependencies:** Requires third-party provider
- **Cost:** Auth services cost money at scale
- **Control:** We want full control over auth

#### vs. API Keys
**API Key Advantages:**
- Simple to implement
- Good for service-to-service auth

**Why Not Chosen:**
- **No Expiration:** Hard to rotate safely
- **No User Context:** Can't carry user info
- **Less Secure:** No signature verification
- **Not for Users:** Better for machines, not humans

#### vs. Magic Links (Passwordless)
**Magic Link Advantages:**
- No password to remember
- More user-friendly
- Resistant to password attacks

**Why Not Chosen:**
- **Requires Email:** Need email service configured
- **Slower UX:** Wait for email, click link
- **More Complex:** Email templates, link generation
- **MVP Scope:** Password auth simpler for now

## Consequences

### Positive

1. **Strong Security:** Protected against XSS and CSRF
2. **Stateless:** Perfect for serverless architecture
3. **Fast Validation:** No DB lookup on every request
4. **Standard Practice:** Well-documented, proven approach
5. **Simple Implementation:** Straightforward code, few dependencies
6. **No External Dependencies:** No Auth0, Firebase, etc. costs
7. **Full Control:** Complete control over auth logic
8. **Mobile-Ready:** Works in web views, React Native

### Negative

1. **Cannot Revoke Tokens:** Once issued, valid until expiry (7 days)
2. **Token Size:** JWT larger than simple session ID (~200 bytes)
3. **Secret Management:** Must securely manage JWT_SECRET
4. **No Refresh Tokens:** Logout doesn't invalidate token server-side
5. **Debugging:** Harder to debug than session cookies
6. **User Changes:** If user role changes, token not updated until re-login
7. **Cross-Domain:** Cookies don't work across different domains (not an issue for us)

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| JWT_SECRET leaked | **Critical** | Store in env vars, rotate immediately if leaked, never commit to git |
| Token stolen (XSS) | High | HTTP-only prevents this; also sanitize inputs, CSP headers |
| Cannot revoke sessions | Medium | Keep expiration short (7 days), add blocklist if needed |
| CSRF attack | Medium | SameSite=Strict cookie prevents this |
| Token too large | Low | Keep payload minimal, compress if needed |
| Clock skew issues | Low | Use reasonable exp times, allow small clock drift |

### Security Best Practices Implemented

**Token Security:**
- Strong secret (32+ characters, randomly generated)
- Reasonable expiration (7 days, not months)
- HTTPS in production (Secure flag)
- Never log tokens
- Never send tokens in URLs

**Cookie Security:**
- HttpOnly flag (prevents JavaScript access)
- Secure flag in production (HTTPS only)
- SameSite=Strict (CSRF protection)
- Path=/ (available to all routes)
- Proper expiration aligned with JWT exp

**Password Security:**
- bcrypt hashing (10 rounds minimum)
- Constant-time comparison
- Never return passwords in responses
- Never log passwords

**Validation:**
- Verify JWT signature
- Check expiration
- Verify user still exists
- Confirm user role

## Implementation Examples

### Login Endpoint
```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = loginSchema.parse(await request.json());

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new UnauthorizedError('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  const response = NextResponse.json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  });

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
```

### Authentication Middleware
```typescript
// middleware/auth.middleware.ts
export async function authenticate(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return { userId: user.id, email: user.email, role: user.role };
}

export function requireAdmin(user: AuthUser) {
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
}
```

### Frontend Auth Context
```typescript
// contexts/AuthContext.tsx
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important: send cookies
    });

    if (response.ok) {
      const { data } = await response.json();
      setUser(data.user);
      // Cookie is automatically set by browser
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
}
```

## Future Enhancements

### Short-Term (Phase 2)
- Token refresh mechanism (refresh tokens)
- Session revocation list (Redis-based)
- Login rate limiting
- Failed attempt tracking

### Medium-Term (Phase 3)
- Remember me checkbox (longer expiration)
- Multiple sessions per user
- Device management (view/revoke sessions)
- Security event logging

### Long-Term (Phase 4)
- Two-factor authentication (2FA)
- Biometric authentication (WebAuthn)
- SSO integration (if needed)
- Granular permission system

## Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|----------------|
| JWT in localStorage | Vulnerable to XSS attacks |
| Server-side sessions | Requires session store (not serverless-friendly) |
| OAuth2/OIDC | Overkill for single admin, adds complexity |
| API Keys | No expiration, less secure, not for users |
| Magic links | Requires email, slower UX, more complex |
| Basic Auth | No session persistence, less secure |
| Passport.js | Adds dependency, more suited for Express |

## Related Decisions

- **ADR-001:** Next.js backend (JWT works great with Next.js cookies API)
- **ADR-002:** Prisma ORM (user lookup during auth)
- Password hashing: bcrypt (industry standard)

## References

- [JWT.io - JSON Web Tokens](https://jwt.io/)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite Cookies Explained](https://web.dev/samesite-cookies-explained/)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

## Review Notes

**Last Reviewed:** 2025-11-21
**Next Review:** 2026-11-21

**Review Criteria:**
- Have we needed immediate token revocation?
- Has cookie-based auth caused issues?
- Would refresh tokens improve UX?
- Has JWT size become problematic?
- Are there better auth patterns now?

**Decision Still Valid?** Yes
**Changes Needed?** Consider refresh tokens if UX demands it

---

**ADR Status:**  Accepted and Implemented
**Last Updated:** 2025-11-21
