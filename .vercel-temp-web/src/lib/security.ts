/**
 * Security Configuration for Classroom Informatika
 * Implements comprehensive security measures for the platform
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  // API endpoints
  LOGIN_ATTEMPTS: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  FILE_UPLOAD: { max: 10, window: 60 * 1000 }, // 10 uploads per minute
  GRADE_SUBMISSION: { max: 50, window: 60 * 1000 }, // 50 grades per minute
  COMMENT_CREATION: { max: 20, window: 60 * 1000 }, // 20 comments per minute
  CLASS_CREATION: { max: 5, window: 60 * 60 * 1000 }, // 5 classes per hour
  
  // Student specific
  ASSIGNMENT_SUBMISSION: { max: 3, window: 60 * 1000 }, // 3 submissions per minute
  CLASS_JOIN: { max: 10, window: 60 * 60 * 1000 }, // 10 class joins per hour
}

// File upload security
export const FILE_SECURITY = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream'
  ],
  ALLOWED_EXTENSIONS: ['.zip'],
  
  // ZIP content validation
  MAX_FILES_IN_ZIP: 50,
  MAX_TOTAL_UNCOMPRESSED_SIZE: 50 * 1024 * 1024, // 50MB uncompressed
  ALLOWED_FILE_EXTENSIONS_IN_ZIP: [
    '.html', '.css', '.js', 
    '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.txt', '.md', '.json'
  ],
  
  // Dangerous patterns to block
  BLOCKED_PATTERNS: [
    /script\s*:/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /on\w+\s*=/i, // Event handlers
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /eval\s*\(/gi,
    /document\.write/gi,
    /innerHTML/gi
  ]
}

// Input validation and sanitization
export const INPUT_VALIDATION = {
  // Class codes
  CLASS_CODE: {
    pattern: /^[A-Z0-9]{6,12}$/,
    minLength: 6,
    maxLength: 12
  },
  
  // User inputs
  NAME: { minLength: 2, maxLength: 100 },
  EMAIL: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 254 },
  DESCRIPTION: { maxLength: 2000 },
  FEEDBACK: { maxLength: 5000 },
  COMMENT: { minLength: 1, maxLength: 1000 },
  
  // Assignment fields
  ASSIGNMENT_TITLE: { minLength: 3, maxLength: 200 },
  ASSIGNMENT_DESCRIPTION: { minLength: 10, maxLength: 5000 },
  ASSIGNMENT_INSTRUCTIONS: { maxLength: 10000 },
  
  // Grade scores
  GRADE_SCORE: { min: 0, max: 1000 }, // Maximum 1000 points
  
  // Rubric validation
  RUBRIC_CRITERION_NAME: { minLength: 3, maxLength: 100 },
  RUBRIC_CRITERION_DESC: { maxLength: 500 },
  RUBRIC_MAX_SCORE: { min: 1, max: 100 },
  RUBRIC_WEIGHT: { min: 0.1, max: 10 }
}

// Role-based access control
export const RBAC = {
  ADMIN: {
    permissions: [
      'create:class',
      'read:class',
      'update:class',
      'delete:class',
      'create:assignment',
      'read:assignment',
      'update:assignment',
      'delete:assignment',
      'read:submission',
      'grade:submission',
      'read:user',
      'update:user',
      'delete:user',
      'read:analytics',
      'manage:system'
    ]
  },
  
  TEACHER: {
    permissions: [
      'create:class',
      'read:own-class',
      'update:own-class',
      'delete:own-class',
      'create:assignment',
      'read:own-assignment',
      'update:own-assignment',
      'delete:own-assignment',
      'read:class-submission',
      'grade:class-submission',
      'comment:class-submission',
      'read:class-analytics'
    ]
  },
  
  STUDENT: {
    permissions: [
      'join:class',
      'read:enrolled-class',
      'read:class-assignment',
      'create:submission',
      'read:own-submission',
      'update:own-submission',
      'comment:own-submission',
      'read:own-grade'
    ]
  }
}

// Session and authentication security
export const AUTH_SECURITY = {
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false // Optional for educational environment
  },
  
  // JWT configuration
  JWT_ALGORITHM: 'HS256',
  JWT_ISSUER: 'classroom-informatika',
  JWT_AUDIENCE: 'classroom-users',
  
  // CSRF protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_TOKEN_DURATION: 60 * 60 * 1000 // 1 hour
}

// Database security
export const DB_SECURITY = {
  // Query timeout (prevent long-running queries)
  QUERY_TIMEOUT: 30000, // 30 seconds
  
  // Connection limits
  MAX_CONNECTIONS: 10,
  CONNECTION_TIMEOUT: 60000, // 1 minute
  
  // Sensitive fields that should never be exposed in API responses
  SENSITIVE_FIELDS: [
    'password',
    'resetToken',
    'refreshToken',
    'internalNotes'
  ],
  
  // Audit logging
  AUDIT_ACTIONS: [
    'user:login',
    'user:logout', 
    'user:create',
    'user:update',
    'user:delete',
    'class:create',
    'class:update',
    'class:delete',
    'assignment:create',
    'assignment:update',
    'assignment:delete',
    'submission:create',
    'submission:grade',
    'grade:create',
    'grade:update'
  ]
}

// Content Security Policy
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://vercel.live"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'img-src': ["'self'", "data:", "https:", "blob:"],
  'media-src': ["'self'", "blob:"],
  'connect-src': ["'self'", "https:", "wss:", "blob:"],
  'frame-src': ["'self'", "blob:", "data:"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}

// API Security Headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

// Validation helper functions
export const validateInput = (input: string, type: keyof typeof INPUT_VALIDATION): boolean => {
  const rules = INPUT_VALIDATION[type] as { minLength?: number; maxLength?: number; pattern?: RegExp; min?: number; max?: number }
  
  if (rules.minLength && input.length < rules.minLength) return false
  if (rules.maxLength && input.length > rules.maxLength) return false
  if (rules.pattern && !rules.pattern.test(input)) return false
  if (rules.min !== undefined && parseFloat(input) < rules.min) return false
  if (rules.max !== undefined && parseFloat(input) > rules.max) return false
  
  return true
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove basic HTML/script characters
    .substring(0, 10000) // Limit length
}

export const validateFileContent = (content: string): boolean => {
  return !FILE_SECURITY.BLOCKED_PATTERNS.some(pattern => pattern.test(content))
}

export const hasPermission = (userRole: keyof typeof RBAC, permission: string): boolean => {
  return RBAC[userRole]?.permissions.includes(permission) || false
}

// Error messages (don't expose internal details)
export const SECURITY_ERRORS = {
  INVALID_INPUT: 'Invalid input provided',
  ACCESS_DENIED: 'Access denied',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'File type not allowed',
  MALICIOUS_CONTENT: 'Content contains unsafe elements',
  SESSION_EXPIRED: 'Session has expired, please login again',
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed attempts'
}