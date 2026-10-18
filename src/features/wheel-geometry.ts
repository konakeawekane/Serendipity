export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export function getWheelSegmentCenter(entryIndex: number, entryCount: number) {
  if (entryCount <= 1) return 0;
  const safeIndex = Math.min(Math.max(Math.floor(entryIndex), 0), entryCount - 1);
  return -90 + (safeIndex + 0.5) * (360 / entryCount);
}

export function getFittedWheelLabelFontSize(
  text: string,
  entryCount: number,
  labelRadius: number,
  availableTextWidth: number,
  maximumFontSize: number,
) {
  const textUnits = Array.from(text).reduce((total, character) => {
    if (" ilI1.,'".includes(character)) return total + 0.32;
    if ('MW@#%&'.includes(character)) return total + 0.9;
    return total + 0.58;
  }, 0);
  const widthLimitedSize = availableTextWidth / Math.max(textUnits, 1);
  const wedgeWidth = entryCount <= 1 ? Number.POSITIVE_INFINITY : 2 * labelRadius * Math.sin(Math.PI / entryCount);
  const wedgeLimitedSize = Math.max(4, (wedgeWidth - 6) * 0.72);
  return Math.max(4, Math.min(maximumFontSize, widthLimitedSize, wedgeLimitedSize));
}

export function getWheelTargetRotation(
  entryIndex: number,
  entryCount: number,
  currentRotation: number,
  fullTurns = 5,
) {
  if (entryCount <= 0) return currentRotation;
  const turns = Math.max(1, Math.floor(fullTurns));
  const segmentCenter = getWheelSegmentCenter(entryIndex, entryCount);
  const desiredRotation = normalizeDegrees(-segmentCenter);
  const forwardOffset = normalizeDegrees(desiredRotation - normalizeDegrees(currentRotation));
  return currentRotation + turns * 360 + forwardOffset;
}
