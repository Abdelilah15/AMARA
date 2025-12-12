// Client/src/utils/formatNumber.js

export const formatCompactNumber = (number) => {
  if (!number) return 0;
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};