/**
 * URL Blocklist Validator
 * Blocks localhost, private IPs, and non-http(s) protocols
 */

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
];

const PRIVATE_IP_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,        // 10.x.x.x
  /^192\.168\.\d{1,3}\.\d{1,3}$/,             // 192.168.x.x
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16-31.x.x
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,         // 127.x.x.x
  /^169\.254\.\d{1,3}\.\d{1,3}$/,             // 169.254.x.x (link-local)
];

export function validateUrl(url) {
  if (!url) return { valid: true };

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  // Block non-http(s) protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: `Protocol "${parsed.protocol}" is not allowed. Only http and https are permitted.` };
  }

  // Block known localhost hostnames
  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { valid: false, reason: 'URLs pointing to localhost or loopback addresses are not allowed.' };
  }

  // Block private IP ranges
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, reason: 'URLs pointing to private/internal IP addresses are not allowed.' };
    }
  }

  return { valid: true };
}

/**
 * Express middleware that validates URL fields in the request body.
 * @param  {...string} fields - Body field names to validate
 */
export function urlBlocklist(...fields) {
  return (req, res, next) => {
    for (const field of fields) {
      const url = req.body[field];
      if (url) {
        const result = validateUrl(url);
        if (!result.valid) {
          return res.status(400).json({
            error: `Invalid ${field}: ${result.reason}`
          });
        }
      }
    }
    next();
  };
}
