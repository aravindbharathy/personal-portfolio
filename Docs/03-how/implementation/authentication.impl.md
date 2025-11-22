# Authentication Implementation

**Type:** Implementation Guide
**Status:** Implemented
**Last Updated:** 2025-11-21

## Overview

End-to-end authentication implementation using JWT tokens with HTTP-only cookies, bcrypt password hashing, and React context for state management.

## Architecture

```
Login Form ’ API /auth/login ’ bcrypt verify ’ JWT generate ’ HTTP-only cookie
                                                                        “
Protected Route ’ Cookie sent automatically ’ JWT verify ’ Allow access
```

## Backend Implementation

### Password Hashing (bcrypt)

**File:** `backend/src/lib/auth.ts`

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
```

### Login Endpoint

**File:** `backend/src/app/api/auth/login/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password (constant-time comparison)
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
```

### Authentication Middleware

**File:** `backend/src/middleware/auth.middleware.ts`

```typescript
export async function authenticate(request: NextRequest) {
  // Extract token from cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  // Verify JWT
  let decoded: TokenPayload;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

export function requireAdmin(user: AuthUser) {
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
}
```

**Usage in Protected Routes:**

```typescript
export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  requireAdmin(user);

  // Protected admin logic here
}
```

### Session Endpoint

**File:** `backend/src/app/api/auth/session/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    return successResponse({
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const { message, statusCode, code } = handleError(error);
    return errorResponse(message, statusCode, code);
  }
}
```

### Logout Endpoint

**File:** `backend/src/app/api/auth/logout/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const response = successResponse({
    message: 'Logged out successfully',
  });

  // Clear cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Immediate expiration
    path: '/',
  });

  return response;
}
```

## Frontend Implementation

### Auth Context

**File:** `frontend/src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include', // Important: send cookies
      });

      if (response.ok) {
        const { data } = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const { data } = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

### Login Page

**File:** `frontend/src/pages/Login.tsx`

```typescript
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);

      // Redirect to intended destination or dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Protected Route Component

```typescript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

## Security Measures

### 1. Password Security
- **Hashing:** bcrypt with 10 rounds (intentionally slow)
- **Salting:** Automatic per-password unique salt
- **Storage:** Never store plaintext passwords
- **Logging:** Never log passwords
- **Response:** Never return password field

### 2. Token Security
- **Algorithm:** HS256 (HMAC SHA-256)
- **Secret:** 32+ character random string in env
- **Expiration:** 7 days (reasonable balance)
- **Signature:** Cryptographic signature prevents tampering

### 3. Cookie Security
- **HttpOnly:** Cannot be accessed by JavaScript (XSS protection)
- **Secure:** HTTPS only in production
- **SameSite=Strict:** Prevents CSRF attacks
- **Path=/:** Available to all routes
- **MaxAge:** Aligned with JWT expiration

### 4. Error Messages
- **Generic:** "Invalid credentials" (don't reveal which field wrong)
- **Timing:** Constant-time password comparison
- **Logging:** Log failed attempts server-side only

## Environment Variables

**File:** `backend/.env`

```bash
# Authentication
JWT_SECRET=your-32-character-random-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio

# Environment
NODE_ENV=production
```

**Security Notes:**
- Never commit `.env` to git
- Use different secrets per environment
- Rotate JWT_SECRET on security incidents
- Use strong random generation for secrets

## Testing

### Backend Tests

```typescript
describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('admin@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should protect admin routes', async () => {
    const response = await request(app)
      .post('/api/projects');

    expect(response.status).toBe(401);
  });
});
```

### Frontend Tests

```typescript
describe('Login Component', () => {
  it('should show error on failed login', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });
});
```

## Related Documentation

- [Authentication Feature](../../02-what/features/authentication.md)
- [Authentication Spec](../specs/authentication.spec.md)
- [JWT + Cookies ADR](../architecture/ADR-003-jwt-cookies.md)

---

**Last Updated:** 2025-11-21
