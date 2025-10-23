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
 * Formats an estimate price range (e.g., "1000-2000" or "1000 - 2000") or single price
 * @param {string|number} estimate - The estimate string or number to parse and format
 * @returns {string} Formatted estimate range or single price
 */
export const formatEstimatePrice = (estimate) => {
  if (!estimate && estimate !== 0) return "N/A";
  
  // If it's already a number, format it directly
  if (typeof estimate === "number") {
    return formatPrice(estimate);
  }
  
  // If it's a string, try to parse it
  if (typeof estimate === "string") {
    // Remove any existing currency symbols or commas
    const cleanEstimate = estimate.replace(/[$,\s]/g, '');
    
    // Handle different separator formats
    const separator = cleanEstimate.includes(' - ') ? ' - ' : '-';
    const parts = cleanEstimate.split(separator);
    
    if (parts.length === 2) {
      // It's a range
      const min = Number(parts[0].trim());
      const max = Number(parts[1].trim());
      
      if (!isNaN(min) && !isNaN(max)) {
        return `${formatPrice(min)} - ${formatPrice(max)}`;
      }
    } else if (parts.length === 1) {
      // It's a single price
      const price = Number(parts[0].trim());
      if (!isNaN(price)) {
        return formatPrice(price);
      }
    }
    
    // If we can't parse it, return as-is
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
  const formatted = formatPrice(price, showDecimals);
  return formatted === "N/A" ? formatted : `${currency}${formatted}`;
};
