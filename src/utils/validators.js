const { DOMAIN_CONFIG, EXTERNAL_LINK_DOMAINS } = require('../config/constants');

function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidDomain(domain) {
  return domain === 'cn' || domain === 'ai';
}

function isValidBoolean(value) {
  return typeof value === 'boolean';
}

function isValidNumber(value, min = -Infinity, max = Infinity) {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

function sanitizeUrl(url) {
  if (!isValidUrl(url)) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return null;
  }
}

function isDomainMatch(hostname, suffix) {
  if (hostname === suffix) return true;
  const dotSuffix = '.' + suffix;
  return hostname.endsWith(dotSuffix);
}

function isExternalLink(currentUrl, targetUrl) {
  try {
    if (!currentUrl || !targetUrl) {
      return false;
    }
    
    const current = new URL(currentUrl);
    const target = new URL(targetUrl);
    const currentDomain = current.hostname;
    const targetDomain = target.hostname;
    
    if (targetDomain === EXTERNAL_LINK_DOMAINS.forum) {
      return true;
    }
    
    const isReservePage = 
      currentUrl.includes(DOMAIN_CONFIG.cn.downloadPath) || 
      currentUrl.includes(DOMAIN_CONFIG.ai.downloadPath);
    
    if (isReservePage) {
      return true;
    }
    
    const isInternal = EXTERNAL_LINK_DOMAINS.allowedSuffixes.some(
      suffix => isDomainMatch(targetDomain, suffix)
    ) || targetDomain === currentDomain || isDomainMatch(targetDomain, currentDomain);
    
    return !isInternal;
  } catch {
    return false;
  }
}

function validateIpcMessage(channel, args, schema) {
  if (!schema) {
    return { valid: true };
  }
  
  for (const [key, validator] of Object.entries(schema)) {
    const value = args[key];
    const result = validator(value);
    if (!result.valid) {
      return { valid: false, field: key, message: result.message };
    }
  }
  
  return { valid: true };
}

const validators = {
  url: (value) => ({
    valid: isValidUrl(value),
    message: 'Invalid URL'
  }),
  domain: (value) => ({
    valid: isValidDomain(value),
    message: 'Invalid domain, must be "cn" or "ai"'
  }),
  boolean: (value) => ({
    valid: isValidBoolean(value),
    message: 'Invalid boolean value'
  }),
  number: (min, max) => (value) => ({
    valid: isValidNumber(value, min, max),
    message: `Invalid number, must be between ${min} and ${max}`
  }),
  optional: (validator) => (value) => {
    if (value === undefined || value === null) {
      return { valid: true };
    }
    return validator(value);
  }
};

module.exports = {
  isValidUrl,
  isValidDomain,
  isValidBoolean,
  isValidNumber,
  sanitizeUrl,
  isExternalLink,
  isDomainMatch,
  validateIpcMessage,
  validators
};
