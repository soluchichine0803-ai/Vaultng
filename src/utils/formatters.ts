/**
 * Formats a number as a currency string (NGN).
 * Example: 5000 -> ₦5,000
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦').trim();
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
