/** Formats a UUID or ID into a readable order number (e.g. #SAM-A1B2C3). */
export function formatOrderNumber(orderId: string): string {
  if (!orderId) return '#000000';
  const compact = orderId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `#SAM-${compact}`;
}
