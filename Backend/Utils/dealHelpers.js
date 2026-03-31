/**
 * Calculates the rounded deal price based on original price and discount percentage
 * @param {number} originalPrice 
 * @param {number} discountPercent 
 * @returns {number}
 */
const calculateDealPrice = (originalPrice, discountPercent) => {
  const dealPrice = originalPrice * (1 - discountPercent / 100);
  return Math.round(dealPrice);
};

/**
 * Validates deal start and end times
 * @param {Date|string} startTime 
 * @param {Date|string} endTime 
 * @returns {string|null}
 */
const validateDealTimes = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start < now) {
    return "Start time cannot be in the past.";
  }

  if (end <= start) {
    return "End time must be after start time.";
  }

  return null;
};

/**
 * Determines deal status based on current time and stock
 * @param {Object} deal 
 * @returns {string}
 */
const getDealStatus = (deal) => {
  const now = new Date();
  const start = new Date(deal.startTime);
  const end = new Date(deal.endTime);

  if (deal.claimedCount >= deal.stockLimit) {
    return 'expired';
  }

  if (now >= end) {
    return 'expired';
  }

  if (now >= start && deal.status === 'approved') {
    return 'live';
  }

  return deal.status;
};

module.exports = {
  calculateDealPrice,
  validateDealTimes,
  getDealStatus
};
