/**
 * Formats a number as a currency string (NGN).
 * Example: 5000 -> ₦5,000.00
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('NGN', '₦').trim();
};

/**
 * Formats a number as a percentage string.
 * Example: 15 -> 15%, 15.5 -> 15.5%
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Formats duration in hours into a human-readable string.
 * Example: 24 -> 1 Day, 48 -> 2 Days, 168 -> 7 Days, 12 -> 12 Hours
 */
export const formatDuration = (hours: number): string => {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  }
  return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
};
