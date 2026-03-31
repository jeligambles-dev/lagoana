"use client";

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function LineChart({ data, color = "#C8A951", height = 200 }: LineChartProps) {
  if (!data.length) return <p className="text-[#888] text-sm">Nicio data disponibila.</p>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };
  const width = 700;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y-axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i));

  // X-axis labels - show every ~5th
  const step = Math.max(1, Math.floor(data.length / 6));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTickValues.map((v) => {
        const y = padding.top + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#2A2A2A" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#888" fontSize={10}>
              {v}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill={color} opacity={0.1} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color}>
          <title>{`${data[i].label}: ${data[i].value}`}</title>
        </circle>
      ))}

      {/* X labels */}
      {data.map((d, i) =>
        i % step === 0 ? (
          <text
            key={i}
            x={points[i].x}
            y={height - 5}
            textAnchor="middle"
            fill="#888"
            fontSize={9}
          >
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function BarChart({ data, color = "#C8A951", height = 220 }: BarChartProps) {
  if (!data.length) return <p className="text-[#888] text-sm">Nicio data disponibila.</p>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 15, right: 20, bottom: 60, left: 45 };
  const width = 700;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = 6;
  const barWidth = Math.max(8, (chartW - barGap * data.length) / data.length);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = padding.left + i * (barWidth + barGap) + barGap / 2;
        const y = padding.top + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} fill={color} rx={3} opacity={0.85}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fill="#EDEDED"
              fontSize={9}
            >
              {d.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={padding.top + chartH + 14}
              textAnchor="end"
              fill="#888"
              fontSize={9}
              transform={`rotate(-35, ${x + barWidth / 2}, ${padding.top + chartH + 14})`}
            >
              {d.label.length > 12 ? d.label.slice(0, 12) + "..." : d.label}
            </text>
          </g>
        );
      })}

      {/* Baseline */}
      <line
        x1={padding.left}
        y1={padding.top + chartH}
        x2={width - padding.right}
        y2={padding.top + chartH}
        stroke="#2A2A2A"
        strokeWidth={1}
      />
    </svg>
  );
}
