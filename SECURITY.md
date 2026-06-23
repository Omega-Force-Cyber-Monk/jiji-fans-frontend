# Security Implementation Guide

This document outlines the security measures implemented in the Content Creator Web application.

## Authentication & Authorization

### Route Protection

The application implements a comprehensive route protection system using guard components:

#### 1. **GuestGuard** (`src/components/guards/GuestGuard.tsx`)
- Prevents authenticated users from accessing auth pages (login, signup, etc.)
- Redirects logged-in users to their appropriate dashboard based on role
- Used in: `(auth)` layout

#### 2. **AuthGuard** (`src/components/guards/AuthGuard.tsx`)
- Ensures only authenticated users can access protected routes
- Redirects unauthenticated users to `/sign-in`
- Used in: `(dashboard)` layout

#### 3. **RoleGuard** (`src/components/guards/RoleGuard.tsx`)
- Provides role-based access control (RBAC)
- Restricts routes to specific user roles
- Used in: `admin` layout (admin-only access)

### Token Management

#### Secure Token Storage (`src/lib/auth/tokenUtils.ts`)
- Tokens stored in HTTP-only cookies (when possible)
- Security flags:
  - `secure: true` (HTTPS-only in production)
  - `sameSite: 'strict'` (CSRF protection)
  - `path: '/'` (application-wide)
- Token expiry: 7 days
- Functions:
  - `setAuthToken()` - Securely store token
  - `getAuthToken()` - Retrieve token
  - `removeAuthToken()` - Clear token on logout
  - `isTokenValid()` - Check token existence
  - `isTokenExpired()` - Client-side expiry check

### API Security

#### Automatic Token Handling (`src/redux/api/baseApi.ts`)
- Automatic token injection in request headers
- 401 response handling with automatic logout
- Prevents stale session attacks

#### Auth State Hydration (`src/app/StoreProvider.tsx`)
- Only fetches user profile when token exists
- Handles authentication errors gracefully
- Prevents unnecessary API calls for unauthenticated users

## Input Validation & Sanitization

### Security Utilities (`src/lib/auth/securityUtils.ts`)

#### Input Validation
- `isValidEmail()` - Email format validation
- `isStrongPassword()` - Password strength requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
- `isValidUrl()` - URL validation
- `isAlphanumeric()` - Alphanumeric check

#### XSS Prevention
- `sanitizeInput()` - Basic HTML entity encoding
- Note: For production, consider using DOMPurify library

#### File Upload Security
- `isValidFileUpload()` - Validates:
  - File type against whitelist
  - File size limits
  - Returns detailed error messages

#### Rate Limiting
- `RateLimiter` class - Client-side rate limiting
- Prevents API abuse
- Configurable attempts and time window

## Security Best Practices

### 1. Authentication Flow
```typescript
// Login flow
1. User submits credentials
2. Server validates and returns token + user data
3. Token stored securely via setAuthToken()
4. User data stored in Redux state
5. User redirected to appropriate dashboard

// Logout flow
1. Redux logout action dispatched
2. Token removed from cookies
3. User state cleared
4. User redirected to login
```

### 2. Protected Route Access
```typescript
// Dashboard access (authenticated users only)
<AuthGuard>
  <DashboardContent />
</AuthGuard>

// Admin access (admin role only)
<RoleGuard allowedRoles={["admin"]}>
  <AdminContent />
</RoleGuard>

// Auth pages (guests only)
<GuestGuard>
  <LoginForm />
</GuestGuard>
```

### 3. API Request Security
- All API requests include Authorization header
- 401 responses trigger automatic logout
- Credentials included for CORS requests
- Token retrieved from secure storage

## Additional Security Considerations

### What's Implemented ✅
- ✅ Route-based authentication guards
- ✅ Role-based access control (RBAC)
- ✅ Secure token storage with HTTP-only cookies
- ✅ Automatic token injection in API requests
- ✅ 401 auto-logout mechanism
- ✅ CSRF protection via SameSite cookies
- ✅ Input validation utilities
- ✅ XSS prevention helpers
- ✅ Client-side rate limiting
- ✅ File upload validation

### Recommended Additions ⚠️
- ⚠️ Server-side session validation
- ⚠️ Token refresh mechanism
- ⚠️ Brute force protection on server
- ⚠️ Content Security Policy (CSP) headers
- ⚠️ Server-side rate limiting
- ⚠️ SQL injection prevention (if using SQL)
- ⚠️ Password hashing (server-side)
- ⚠️ Two-factor authentication (2FA)
- ⚠️ Security audit logging
- ⚠️ HTTPS enforcement in production

## Environment Variables

Ensure these are properly configured:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api.com
NODE_ENV=production

# Security
NEXT_PUBLIC_IS_PRODUCTION=true
```

## Reporting Security Issues

If you discover a security vulnerability, please email security@yourcompany.com instead of using the issue tracker.

## Security Headers (Next.js Config)

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## Testing Security

### Manual Testing Checklist
- [ ] Try accessing admin routes as non-admin user
- [ ] Try accessing dashboard without authentication
- [ ] Try accessing login page when authenticated
- [ ] Verify token expiry handling
- [ ] Test file upload restrictions
- [ ] Test input validation on forms
- [ ] Verify CSRF token on state-changing operations

### Automated Testing
Consider adding security tests using Jest and React Testing Library:
- Guard component behavior
- Token utility functions
- Input validation functions
- Rate limiter functionality

## Updates

Last updated: 2025-10-01

Review this document regularly and update security measures as needed.
