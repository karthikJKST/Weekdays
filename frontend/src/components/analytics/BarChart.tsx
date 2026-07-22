import { useMemo } from 'react'

interface BarData {
  label: string
  value: number
  color: string
}

interface BarChartProps {
  data: BarData[]
  height?: number
  showValues?: boolean
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data])
  const barGap = 8

  const containerStyle = {
    height: height + 'px',
    gap: barGap + 'px',
  }

  return (
    <div className="flex items-end" style={containerStyle}>
      {data.map((item) => {
        const pct = (item.value / maxValue) * 100
        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            {showValues && (
              <span className="text-[11px] font-medium text-slate-400">{item.value}</span>
            )}
            <div
              className="w-full rounded-md transition-all duration-500 ease-out"
              style={{
                height: pct + '%',
                backgroundColor: item.color,
                minHeight: item.value > 0 ? '4px' : '0px',
              }}
            />
            <span className="text-[10px] text-slate-600 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
