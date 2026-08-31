import React from "react";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { colors } from "../../theme/theme";

type Props = { size?: number };

const VIEWBOX = "0 0 320 220";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={VIEWBOX} fill="none">
      <Rect x={0} y={0} width={320} height={220} rx={20} fill={colors.accentSoft} />
      {children}
    </Svg>
  );
}

export function SwedishIllustration(_: Props) {
  return (
    <Frame>
      {/* table */}
      <Rect x={70} y={140} width={190} height={10} rx={5} fill={colors.primary} opacity={0.35} />
      <Rect x={85} y={150} width={8} height={26} rx={3} fill={colors.primary} opacity={0.35} />
      <Rect x={235} y={150} width={8} height={26} rx={3} fill={colors.primary} opacity={0.35} />
      {/* body */}
      <Rect x={95} y={108} width={140} height={34} rx={17} fill={colors.primary} />
      <Circle cx={252} cy={125} r={19} fill={colors.primary} />
      {/* bolster */}
      <Rect x={255} y={116} width={16} height={18} rx={8} fill={colors.accent} opacity={0.6} />
      {/* therapist hands */}
      <Ellipse cx={140} cy={90} rx={13} ry={9} fill={colors.accent} />
      <Ellipse cx={172} cy={90} rx={13} ry={9} fill={colors.accent} />
      <Path d="M140 82 L134 56" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
      <Path d="M172 82 L178 56" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
      {/* leaf accent */}
      <Path
        d="M40 60 C55 45 78 45 88 62 C78 70 55 72 40 60 Z"
        fill={colors.primary}
        opacity={0.5}
      />
    </Frame>
  );
}

export function CouplesIllustration(_: Props) {
  return (
    <Frame>
      {/* two tables */}
      <Rect x={38} y={140} width={110} height={9} rx={4.5} fill={colors.primary} opacity={0.35} />
      <Rect x={172} y={140} width={110} height={9} rx={4.5} fill={colors.primary} opacity={0.35} />
      {/* bodies */}
      <Rect x={46} y={110} width={82} height={28} rx={14} fill={colors.primary} />
      <Circle cx={136} cy={124} r={15} fill={colors.primary} />
      <Rect x={180} y={110} width={82} height={28} rx={14} fill={colors.primary} />
      <Circle cx={184} cy={124} r={15} fill={colors.primary} />
      {/* hands above each */}
      <Ellipse cx={88} cy={92} rx={11} ry={8} fill={colors.accent} />
      <Ellipse cx={220} cy={92} rx={11} ry={8} fill={colors.accent} />
      <Path d="M88 84 L88 62" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
      <Path d="M220 84 L220 62" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" />
      {/* connecting heart-ish accent between tables */}
      <Circle cx={160} cy={168} r={4} fill={colors.accent} />
      <Circle cx={148} cy={176} r={3} fill={colors.accent} opacity={0.6} />
      <Circle cx={172} cy={176} r={3} fill={colors.accent} opacity={0.6} />
    </Frame>
  );
}

export function BeautyIllustration(_: Props) {
  return (
    <Frame>
      {/* bowl */}
      <Path
        d="M110 150 Q160 190 210 150 L204 150 Q160 176 116 150 Z"
        fill={colors.primary}
      />
      <Ellipse cx={160} cy={150} rx={50} ry={8} fill={colors.primary} opacity={0.4} />
      {/* steam / droplet */}
      <Path
        d="M160 60 C176 84 176 100 160 112 C144 100 144 84 160 60 Z"
        fill={colors.accent}
      />
      {/* leaves */}
      <Path
        d="M96 96 C112 80 138 80 150 96 C138 108 112 110 96 96 Z"
        fill={colors.primary}
        opacity={0.55}
      />
      <Path
        d="M224 96 C208 80 182 80 170 96 C182 108 208 110 224 96 Z"
        fill={colors.primary}
        opacity={0.55}
      />
    </Frame>
  );
}
