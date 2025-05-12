const haversine = require('haversine-distance');

// Calculate distance in meters between two coordinates
const calculateDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return 0;
  return haversine(coords1, coords2); // returns meters
};

// Estimate travel time in minutes (urban London traffic)
const calculateTravelTime = (coords1, coords2) => {
  const distanceMeters = calculateDistance(coords1, coords2);
  const distanceKm = distanceMeters / 1000;
  
  // London-specific factors
  const baseSpeed = 30; // km/h average in London traffic
  const congestionFactor = 1.5; // adjustment for urban congestion
  
  const timeHours = (distanceKm / baseSpeed) * congestionFactor;
  return Math.round(timeHours * 60); // convert to minutes
};

module.exports = {
  calculateDistance,
  calculateTravelTime
};
