import { useMemo } from 'react';

type Props = {
  className?: string;
  teeth?: number;
  depthPct?: number;
  strokeWidth?: number;
  color?: string;
};

export default function ZigzagDivider({
  className,
  teeth = 24,
  depthPct = 50,
  strokeWidth = 3,
  color = '#2563eb', // Matching --color-primary-600 from Tailwind tokens
}: Props) {
  const strokePoints = useMemo(() => {
    const t = Math.max(2, Math.round(teeth));
    const VBH = 10;
    const depth = Math.min(100, Math.max(1, depthPct));
    const depthUnits = (depth / 100) * VBH;
    const segments = t * 2;
    const pts: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 100;
      const y = i % 2 === 0 ? 0 : depthUnits;
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }, [teeth, depthPct]);

  return (
    <div className={'relative w-full h-3 ' + (className ?? '')} aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <polyline
          points={strokePoints}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
