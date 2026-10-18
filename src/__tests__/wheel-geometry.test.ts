import { getFittedWheelLabelFontSize, getWheelSegmentCenter, getWheelTargetRotation, normalizeDegrees } from '../features/wheel-geometry';

describe('wheel geometry', () => {
  test('normalizes positive and negative rotations', () => {
    expect(normalizeDegrees(450)).toBe(90);
    expect(normalizeDegrees(-90)).toBe(270);
  });

  test('lands the selected segment center at the right-side pointer', () => {
    const target = getWheelTargetRotation(1, 4, 0, 5);
    const segmentCenter = getWheelSegmentCenter(1, 4);
    expect(normalizeDegrees(segmentCenter + target)).toBeCloseTo(0);
    expect(target).toBeGreaterThanOrEqual(5 * 360);
  });

  test('orients every label upright when its segment reaches the pointer', () => {
    for (let index = 0; index < 8; index += 1) {
      const labelRotation = getWheelSegmentCenter(index, 8);
      const wheelRotation = getWheelTargetRotation(index, 8, 0, 5);
      expect(normalizeDegrees(labelRotation + wheelRotation)).toBeCloseTo(0);
    }
  });

  test('shrinks long and densely packed wheel labels', () => {
    const shortLabel = getFittedWheelLabelFontSize('Go', 6, 91, 98, 15);
    const longLabel = getFittedWheelLabelFontSize('WWWWWWWWWWWWWWWWWWWW', 6, 91, 98, 15);
    const denseLabel = getFittedWheelLabelFontSize('Idea', 60, 110, 60, 7);

    expect(shortLabel).toBe(15);
    expect(longLabel).toBeLessThan(shortLabel);
    expect(denseLabel).toBeLessThan(7);
  });

  test('continues forward from the previous rotation', () => {
    const previous = getWheelTargetRotation(2, 5, 0, 5);
    const next = getWheelTargetRotation(0, 5, previous, 5);
    expect(next).toBeGreaterThan(previous);
  });

  test('handles empty and single-entry wheels', () => {
    expect(getWheelTargetRotation(0, 0, 42)).toBe(42);
    expect(normalizeDegrees(getWheelTargetRotation(0, 1, 0, 3))).toBe(0);
  });
});
