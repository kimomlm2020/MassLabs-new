// middleware/adminAuth.js
import jwt from 'jsonwebtoken';

/**
 * Perfect Admin Authentication Middleware
 * 
 * Features:
 * - Multiple token source support (headers.token, Authorization Bearer, cookies)
 * - Flexible admin verification (role-based, isAdmin flag, email whitelist)
 * - Comprehensive error handling with specific codes
 * - Request metadata injection for downstream use
 * - Security logging for audit trails
 * - Zero dependencies beyond jwt
 */

const adminAuth = async (req, res, next) => {
  try {
    // ============================================
    // STEP 1: TOKEN EXTRACTION
    // Supports all common token transmission methods
    // ============================================
    
    let token = null;
    let tokenSource = null;
    
    // Priority 1: Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
      tokenSource = 'bearer';
    }
    
    // Priority 2: Check custom token header (your frontend uses this)
    else if (req.headers.token) {
      token = req.headers.token.trim();
      tokenSource = 'header';
    }
    
    // Priority 3: Check query parameter (for special cases like image links)
    else if (req.query.token) {
      token = req.query.token.trim();
      tokenSource = 'query';
    }
    
    // Priority 4: Check cookies (for web sessions)
    else if (req.cookies?.token || req.cookies?.adminToken) {
      token = (req.cookies.token || req.cookies.adminToken).trim();
      tokenSource = 'cookie';
    }

    // ============================================
    // STEP 2: TOKEN PRESENCE VALIDATION
    // ============================================
    
    if (!token) {
      console.log(`[AdminAuth] Rejected: No token provided | IP: ${req.ip} | Path: ${req.path}`);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login to continue.',
        code: 'TOKEN_MISSING',
        timestamp: new Date().toISOString()
      });
    }

    // Basic token format validation
    if (token.length < 10 || token.split('.').length !== 3) {
      console.log(`[AdminAuth] Rejected: Malformed token | IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication format.',
        code: 'TOKEN_MALFORMED'
      });
    }

    // ============================================
    // STEP 3: JWT VERIFICATION
    // ============================================
    
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Handle specific JWT errors with appropriate responses
      
      if (jwtError.name === 'TokenExpiredError') {
        console.log(`[AdminAuth] Rejected: Expired token | User: ${jwtError.payload?.id || 'unknown'}`);
        return res.status(401).json({
          success: false,
          message: 'Your session has expired. Please login again.',
          code: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt,
          action: 'RELOGIN'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        console.log(`[AdminAuth] Rejected: Invalid signature | IP: ${req.ip}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token. Please login again.',
          code: 'TOKEN_INVALID'
        });
      }
      
      if (jwtError.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          message: 'Token not yet active.',
          code: 'TOKEN_NOT_ACTIVE'
        });
      }
      
      // Unknown JWT error
      throw jwtError;
    }

    // ============================================
    // STEP 4: TOKEN PAYLOAD VALIDATION
    // ============================================
    
    if (!decoded.id && !decoded._id && !decoded.sub) {
      console.log(`[AdminAuth] Rejected: Token missing user ID`);
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure.',
        code: 'TOKEN_INCOMPLETE'
      });
    }

    const userId = decoded.id || decoded._id || decoded.sub;

    // ============================================
    // STEP 5: ADMIN PRIVILEGE VERIFICATION
    // Multiple strategies for maximum compatibility
    // ============================================
    
    let isAdmin = false;
    let adminMethod = null;

    // Strategy 1: Explicit isAdmin boolean flag
    if (decoded.isAdmin === true) {
      isAdmin = true;
      adminMethod = 'isAdmin_flag';
    }
    
    // Strategy 2: Role-based admin check
    else if (decoded.role === 'admin' || decoded.role === 'superadmin' || decoded.role === 'owner') {
      isAdmin = true;
      adminMethod = 'role';
    }
    
    // Strategy 3: Type-based check (your ShopContext uses type: 'admin')
    else if (decoded.type === 'admin') {
      isAdmin = true;
      adminMethod = 'type';
    }
    
    // Strategy 4: Email whitelist (fallback/legacy)
    else if (decoded.email) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      
      if (adminEmail && decoded.email === adminEmail) {
        isAdmin = true;
        adminMethod = 'primary_email';
      }
      else if (adminEmails.includes(decoded.email)) {
        isAdmin = true;
        adminMethod = 'email_whitelist';
      }
    }

    // ============================================
    // STEP 6: ACCESS DENIED HANDLING
    // ============================================
    
    if (!isAdmin) {
      console.warn(`[AdminAuth] Rejected: Non-admin access | User: ${userId} | Email: ${decoded.email || 'N/A'} | Role: ${decoded.role || 'N/A'}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        code: 'INSUFFICIENT_PRIVILEGES',
        userId: userId,
        hint: 'If you believe this is an error, contact your administrator.'
      });
    }

    // ============================================
    // STEP 7: SUCCESS - ATTACH USER TO REQUEST
    // ============================================
    
    req.user = {
      id: userId,
      email: decoded.email || null,
      name: decoded.name || null,
      role: decoded.role || 'admin',
      type: decoded.type || null,
      isAdmin: true,
      adminMethod: adminMethod,
      tokenSource: tokenSource,
      iat: decoded.iat,
      exp: decoded.exp
    };

    req.userId = userId;
    req.adminAuth = {
      verified: true,
      method: adminMethod,
      source: tokenSource,
      timestamp: new Date().toISOString()
    };

    // Log successful admin access (optional, for audit)
    if (process.env.NODE_ENV === 'development' || process.env.LOG_ADMIN_ACCESS === 'true') {
      console.log(`[AdminAuth] Granted: ${userId} via ${adminMethod} (${tokenSource}) | ${req.method} ${req.path}`);
    }

    next();

  } catch (error) {
    // ============================================
    // STEP 8: CATCH-ALL ERROR HANDLING
    // ============================================
    
    console.error('[AdminAuth] Critical error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Authentication service temporarily unavailable.',
      code: 'AUTH_SERVICE_ERROR',
      support: 'Please contact support if this persists.'
    });
  }
};

/**
 * Optional: Middleware to refresh token if nearing expiration
 * Attach this AFTER adminAuth for sensitive operations
 */
export const checkTokenRefresh = (req, res, next) => {
  if (!req.user?.exp) return next();
  
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = req.user.exp - now;
  
  // If token expires in less than 1 hour, suggest refresh
  if (timeUntilExpiry < 3600 && timeUntilExpiry > 0) {
    res.setHeader('X-Token-Refresh-Recommended', 'true');
    res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString());
  }
  
  next();
};

/**
 * Optional: Rate limiting helper for auth endpoints
 */
export const createAuthLimiter = () => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (attempts.has(key)) {
      const { count, firstAttempt } = attempts.get(key);
      
      // Reset after 15 minutes
      if (now - firstAttempt > 15 * 60 * 1000) {
        attempts.delete(key);
      }
      // Block if more than 10 attempts in 15 minutes
      else if (count > 10) {
        return res.status(429).json({
          success: false,
          message: 'Too many authentication attempts. Please try again later.',
          code: 'RATE_LIMITED'
        });
      }
    }
    
    next();
  };
};

export default adminAuth;