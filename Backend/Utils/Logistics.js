/**
 * Multi-Seller Marketplace Logistics Utility
 * Handles EDD (Estimated Delivery Date) and Zone calculations
 */

const HOLIDAYS = [
  "2026-01-26", // Republic Day
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
  // Add other major ones if needed
];

const ZONES = {
  LOCAL: { days: 1, label: "Same City" },
  ZONE_A: { days: 2, label: "Nearby State" },
  ZONE_B: { days: 4, label: "Far State" },
  ZONE_C: { days: 7, label: "Remote / NE / J&K" },
};

/**
 * Determine Zone based on Seller and Customer Pincodes (India-specific logic)
 * In a real app, this would use a distance API or mapping table.
 * For now, we use a digit-based logic:
 * - Same PIN or first 3 digits: LOCAL
 * - Same first digit: ZONE A
 * - Different first digit: ZONE B
 * - Remote (NE, J&K prefixes): ZONE C
 */
const getZone = (sellerPin, customerPin) => {
  const remotePrefixes = ["18", "19", "78", "79", "80"]; // J&K, North East, etc.
  
  const isRemote = remotePrefixes.some(p => customerPin.startsWith(p));
  if (isRemote) return "ZONE_C";

  if (sellerPin === customerPin || sellerPin.substring(0, 3) === customerPin.substring(0, 3)) {
    return "LOCAL";
  }

  if (sellerPin[0] === customerPin[0]) {
    return "ZONE_A";
  }

  return "ZONE_B";
};

/**
 * Calculate EDD based on formula: T0 + handling + zone + holiday_buffer
 */
const calculateEDD = (orderDate, handlingDays, zone) => {
  let edd = new Date(orderDate);
  
  // Cut-off logic: after 2 PM adds +1 day to handling
  if (edd.getHours() >= 14) {
    handlingDays += 1;
  }

  let totalDaysToAdd = handlingDays + ZONES[zone].days;
  let addedDays = 0;

  while (addedDays < totalDaysToAdd) {
    edd.setDate(edd.getDate() + 1);
    
    // Check if Sunday
    if (edd.getDay() === 0) continue; 
    
    // Check if Public Holiday
    const dateStr = edd.toISOString().split("T")[0];
    if (HOLIDAYS.includes(dateStr)) continue;

    addedDays++;
  }

  return edd;
};

const isCodServiceable = (pinCode) => {
  const zone = getZone("110001", pinCode); // Assume platform central seller is Delhi
  return zone !== "ZONE_C"; // COD not available for Zone C/Remote
};

module.exports = {
  getZone,
  calculateEDD,
  isCodServiceable,
};
