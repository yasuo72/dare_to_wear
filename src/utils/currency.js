// Currency conversion utility
const USD_TO_INR_RATE = 83; // Approximate conversion rate (you can make this dynamic)

export const convertToINR = (usdPrice) => {
  if (!usdPrice || isNaN(usdPrice)) return 0;
  return Math.round(usdPrice * USD_TO_INR_RATE);
};

export const formatINR = (price) => {
  if (!price || isNaN(price)) return '₹0';
  const inrPrice = convertToINR(price);
  return `₹${inrPrice.toLocaleString('en-IN')}`;
};

export const formatPrice = (price, currency = 'INR') => {
  if (!price || isNaN(price)) return currency === 'INR' ? '₹0' : '$0';
  if (currency === 'INR') {
    return formatINR(price);
  }
  return `$${price}`;
};
