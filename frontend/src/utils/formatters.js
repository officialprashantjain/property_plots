// formatters.js - Common data formatting utilities

/**
 * Format a number as currency (INR by default)
 * @param {number} amount
 * @param {string} locale
 * @param {string} currency
 */
export function formatCurrency(amount, locale = "en-IN", currency = "INR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to readable format
 * @param {string|Date} date
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate long strings to a given max length
 * @param {string} str
 * @param {number} maxLen
 */
export function truncate(str, maxLen = 60) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
