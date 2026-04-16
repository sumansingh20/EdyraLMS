const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

// JWT Configuration
const JWT_ACCESS_EXPIRY = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRE || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

/**
 * Generate Access Token
 */
const generateAccessToken = (userId, role) => {
  try {
    return jwt.sign(
      { id: userId, role },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRY }
    );
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  try {
    return jwt.sign(
      { id: userId },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRY }
    );
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate Both Tokens
 */
const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    logger.error('Refresh token verification failed:', error.message);
    return null;
  }
};

/**
 * Generate Password Reset Token
 */
const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return { token, hashedToken };
};

/**
 * Generate Email Verification Token
 */
const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return { token, hashedToken };
};

/**
 * Generate Device Session ID
 */
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Hash IP Address for privacy
 */
const hashIPAddress = (ipAddress) => {
  return crypto
    .createHash('sha256')
    .update(ipAddress + (process.env.IP_HASH_SECRET || 'secret'))
    .digest('hex');
};

/**
 * Generate Device Fingerprint
 */
const generateDeviceFingerprint = (userAgent, ipHash, screenResolution) => {
  const fingerprint = `${userAgent}|${ipHash}|${screenResolution}`;
  return crypto
    .createHash('sha256')
    .update(fingerprint)
    .digest('hex');
};

/**
 * Decode JWT without verification (for debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Extract Bearer Token from Authorization Header
 */
const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateSessionId,
  hashIPAddress,
  generateDeviceFingerprint,
  decodeToken,
  extractBearerToken,
};
