import { useMemo } from 'react'

interface DoughnutData {
  label: string
  value: number
  color: string
}

interface DoughnutChartProps {
  data: DoughnutData[]
  size?: number
  innerRatio?: number
  showLegend?: boolean
}

export function DoughnutChart({
  data,
  size = 160,
  innerRatio = 0.65,
  showLegend = true,
}: DoughnutChartProps) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])
  const radius = size / 2
  const innerRadius = radius * innerRatio
  const strokeWidth = radius - innerRadius
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2)

  const segments = useMemo(() => {
    let offset = 0
    return data
      .filter((d) => d.value > 0)
      .map((d) => {
        const length = (d.value / total) * circumference
        const seg = { ...d, length, offset }
        offset += length
        return seg
      })
  }, [data, total, circumference])

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xs text-slate-600">No data</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90 ${radius} ${radius})`}
            className="transition-all duration-500"
            style={{ cursor: 'pointer' }}
          />
        ))}
        {/* Center text */}
        <text
          x={radius}
          y={radius - 4}
          textAnchor="middle"
          className="fill-slate-200 text-lg font-semibold"
        >
          {total}
        </text>
        <text
          x={radius}
          y={radius + 12}
          textAnchor="middle"
          className="fill-slate-500 text-[10px]"
        >
          Total
        </text>
      </svg>

      {showLegend && (
        <div className="space-y-1.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-slate-400">{d.label}</span>
              <span className="text-xs text-slate-500 ml-auto">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
