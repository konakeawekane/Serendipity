import Svg, { Circle, Path } from 'react-native-svg';

type Props = { color: string; size?: number };

export function PaintSplatter({ color, size = 110 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 110 110" pointerEvents="none">
      <Path d="M21 51c8-8 4-23 16-28 9-4 15 5 22 5 9 0 16-12 25-5 9 6 1 18 7 26 6 7 19 9 15 21-4 10-17 6-26 12-8 5-10 19-23 15-10-3-8-15-16-21-7-5-20-4-23-14-2-5-1-8 3-11Z" fill={color} opacity={0.24} />
      <Circle cx="15" cy="31" r="5" fill={color} opacity={0.45} />
      <Circle cx="95" cy="17" r="4" fill={color} opacity={0.55} />
      <Circle cx="99" cy="95" r="7" fill={color} opacity={0.32} />
    </Svg>
  );
}
