import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { getFittedWheelLabelFontSize, getWheelSegmentCenter } from '@/features/wheel-geometry';
import { usePlayfulTheme } from '@/theme/ThemeProvider';
import type { LibraryEntry } from '@/types/domain';

const VIEWBOX_SIZE = 320;
const CENTER = VIEWBOX_SIZE / 2;
const RADIUS = 148;

type Props = {
  entries: LibraryEntry[];
  rotation: Animated.AnimatedInterpolation<string | number>;
  spinning: boolean;
};

export function SpinWheel({ entries, rotation, spinning }: Props) {
  const { colors } = usePlayfulTheme();
  const segmentColors = [colors.primary, colors.where, colors.secondary, colors.caveat, colors.when];
  const segmentAngle = entries.length ? 360 / entries.length : 360;
  const maximumFontSize = entries.length <= 6 ? 15 : entries.length <= 10 ? 12 : entries.length <= 16 ? 9 : 7;
  const maxCharacters = entries.length <= 6 ? 20 : entries.length <= 10 ? 15 : entries.length <= 16 ? 11 : 7;
  const labelRadius = entries.length <= 10 ? 91 : entries.length <= 16 ? 103 : 110;
  const availableTextWidth = 2 * Math.min(labelRadius - 42, 140 - labelRadius);
  const accessibleOptions = entries.map((entry) => entry.text).join(', ');

  return (
    <View
      accessible
      accessibilityLabel={`Prize wheel with ${entries.length} ${entries.length === 1 ? 'option' : 'options'}: ${accessibleOptions}`}
      accessibilityState={{ busy: spinning }}
      style={styles.frame}>
      <Animated.View style={[styles.wheelShadow, { transform: [{ rotate: rotation }], shadowColor: colors.shadow }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
          <G>
            {entries.length === 1 ? (
              <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill={segmentColors[0]} stroke={colors.text} strokeWidth={3} />
            ) : (
              entries.map((entry, index) => {
                const startAngle = -90 + index * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                return (
                  <Path
                    key={entry.id}
                    d={describeSegment(startAngle, endAngle)}
                    fill={segmentColors[index % segmentColors.length]}
                    stroke={colors.text}
                    strokeWidth={1.5}
                  />
                );
              })
            )}
            {entries.map((entry, index) => {
              const angle = getWheelSegmentCenter(index, entries.length);
              const labelPoint = polarPoint(CENTER, CENTER, labelRadius, angle);
              const label = shortenLabel(entry.text, maxCharacters);
              const fontSize = getFittedWheelLabelFontSize(
                label,
                entries.length,
                labelRadius,
                availableTextWidth,
                maximumFontSize,
              );
              return (
                <SvgText
                  key={`label-${entry.id}`}
                  x={labelPoint.x}
                  y={labelPoint.y}
                  fill={contrastText(segmentColors[index % segmentColors.length])}
                  fontSize={fontSize}
                  fontWeight="800"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${angle} ${labelPoint.x} ${labelPoint.y})`}>
                  {label}
                </SvgText>
              );
            })}
          </G>
          <Circle cx={CENTER} cy={CENTER} r={34} fill={colors.surface} stroke={colors.text} strokeWidth={4} />
          <SvgText x={CENTER} y={CENTER + 2} fill={colors.primary} fontSize={25} fontWeight="900" textAnchor="middle" alignmentBaseline="middle">✦</SvgText>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={colors.text} strokeWidth={4} />
        </Svg>
      </Animated.View>
      <View pointerEvents="none" style={styles.pointer}>
        <Svg width="100%" height="100%" viewBox="0 0 50 54">
          <Polygon points="3,27 46,4 46,50" fill={colors.surface} stroke={colors.text} strokeWidth={4} strokeLinejoin="round" />
        </Svg>
      </View>
    </View>
  );
}

function describeSegment(startAngle: number, endAngle: number) {
  const start = polarPoint(CENTER, CENTER, RADIUS, startAngle);
  const end = polarPoint(CENTER, CENTER, RADIUS, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function polarPoint(centerX: number, centerY: number, radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return { x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) };
}

function shortenLabel(value: string, maximum: number) {
  const clean = value.trim();
  return clean.length <= maximum ? clean : `${clean.slice(0, Math.max(1, maximum - 1)).trimEnd()}…`;
}

function contrastText(color: string) {
  const clean = color.replace('#', '');
  if (clean.length !== 6) return '#241620';
  const red = Number.parseInt(clean.slice(0, 2), 16);
  const green = Number.parseInt(clean.slice(2, 4), 16);
  const blue = Number.parseInt(clean.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 155 ? '#241620' : '#FFFFFF';
}

const styles = StyleSheet.create({
  frame: { width: '88%', maxWidth: 370, aspectRatio: 1, alignSelf: 'center', position: 'relative', marginVertical: 8 },
  wheelShadow: { width: '100%', height: '100%', borderRadius: 999, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 7 }, elevation: 7 },
  pointer: { position: 'absolute', width: 50, height: 54, right: -20, top: '50%', transform: [{ translateY: -27 }] },
});
