/**
 * Utility functions for formatting prices with proper comma separators
 */

/**
 * Formats a price with commas and optional decimal places
 * @param {number|string} price - The price to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: false)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, showDecimals = false) => {
  if (!price && price !== 0) return "N/A";
  
  const numPrice = Number(price);
  if (isNaN(numPrice)) return "N/A";
  
  if (showDecimals) {
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  return numPrice.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Formats an estimate price range (e.g., "$1000 - $2000" or "1000-2000") or single price
 * @param {string|number} estimate - The estimate string or number to parse and format
 * @param {string} currency - Currency symbol (default: "$")
 * @returns {string} Formatted estimate range or single price
 */
export const formatEstimatePrice = (estimate, currency = "$") => {
  if (!estimate && estimate !== 0) return "N/A";
  
  // If it's already a number, format it directly
  if (typeof estimate === "number") {
    return `${currency}${formatPrice(estimate)}`;
  }
  
  // If it's a string, try to parse it
  if (typeof estimate === "string") {
    // Check if it's already formatted or has complex structure
    // but we want to re-format it to ensure commas are correct
    
    // Remove any existing currency symbols or commas for parsing
    const cleanEstimate = estimate.replace(/[$,\s]/g, '');
    
    // Handle different separator formats
    const separator = cleanEstimate.includes('-') ? '-' : null;
    
    if (separator) {
      const parts = cleanEstimate.split('-');
      
      if (parts.length === 2) {
        // It's a range
        const min = Number(parts[0].trim());
        const max = Number(parts[1].trim());
        
        if (!isNaN(min) && !isNaN(max)) {
          return `${currency}${formatPrice(min)} - ${currency}${formatPrice(max)}`;
        }
      }
    }
    
    // It might be a single price string
    const singlePrice = Number(cleanEstimate);
    if (!isNaN(singlePrice)) {
      return `${currency}${formatPrice(singlePrice)}`;
    }
    
    // If we can't parse it as numbers but it has a '-', try to just clean individual parts
    if (estimate.includes('-')) {
        return estimate.split('-').map(part => {
            const cleanPart = part.replace(/[$,\s]/g, '');
            const num = Number(cleanPart);
            return isNaN(num) ? part.trim() : `${currency}${formatPrice(num)}`;
        }).join(' - ');
    }
    
    // If we can't parse it at all, return as-is
    return estimate;
  }
  
  return "N/A";
};

/**
 * Formats a price with currency symbol
 * @param {number|string} price - The price to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @param {string} currency - Currency symbol (default: "$")
 * @returns {string} Formatted price with currency
 */
export const formatPriceWithCurrency = (price, showDecimals = false, currency = "$") => {
  if (!price && price !== 0) return "N/A";

  // If it's a range string, use formatEstimatePrice
  if (typeof price === "string" && (price.includes("-") || isNaN(Number(price.replace(/[$,\s]/g, ''))))) {
    return formatEstimatePrice(price, currency);
  }

  const formatted = formatPrice(price, showDecimals);
  return formatted === "N/A" ? formatted : `${currency}${formatted}`;
};
