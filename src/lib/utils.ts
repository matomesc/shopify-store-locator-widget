export function isImperial(countryCode: string) {
  return (
    countryCode === 'US' ||
    countryCode === 'GB' ||
    countryCode === 'LR' ||
    countryCode === 'MM'
  );
}

export function roundDistance(distance: number) {
  if (distance < 10) {
    return distance.toFixed(1);
  }
  return distance.toFixed(0);
}
