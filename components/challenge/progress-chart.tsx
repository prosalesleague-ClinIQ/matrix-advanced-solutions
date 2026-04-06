'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface DataPoint {
  week: number
  value: number | null
}

interface ProgressChartProps {
  data: DataPoint[]
  label: string
  unit: string
  color?: string
}

const CHART_HEIGHT = 200
const CHART_PADDING = { top: 20, right: 20, bottom: 30, left: 45 }

export function ProgressChart({
  data,
  label,
  unit,
  color = '#22d3ee',
}: ProgressChartProps) {
  const { points, polyline, areaPath, yTicks, xTicks, innerWidth, innerHeight } =
    useMemo(() => {
      const validData = data.filter(
        (d): d is { week: number; value: number } => d.value != null
      )

      if (validData.length === 0) {
        return {
          points: [],
          polyline: '',
          areaPath: '',
          yTicks: [],
          xTicks: [],
          innerWidth: 0,
          innerHeight: 0,
        }
      }

      const iW = 600 - CHART_PADDING.left - CHART_PADDING.right
      const iH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

      const minWeek = Math.min(...data.map((d) => d.week))
      const maxWeek = Math.max(...data.map((d) => d.week))
      const weekRange = maxWeek - minWeek || 1

      const values = validData.map((d) => d.value)
      const minVal = Math.min(...values)
      const maxVal = Math.max(...values)
      const valRange = maxVal - minVal || 1
      const valPadding = valRange * 0.1

      const scaleX = (week: number) =>
        CHART_PADDING.left + ((week - minWeek) / weekRange) * iW
      const scaleY = (val: number) =>
        CHART_PADDING.top +
        iH -
        ((val - (minVal - valPadding)) / (valRange + valPadding * 2)) * iH

      const pts = validData.map((d) => ({
        x: scaleX(d.week),
        y: scaleY(d.value),
        week: d.week,
        value: d.value,
      }))

      const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

      const area =
        pts.length > 0
          ? `${line} L${pts[pts.length - 1].x},${CHART_PADDING.top + iH} L${pts[0].x},${CHART_PADDING.top + iH} Z`
          : ''

      const yTickCount = 5
      const yTickValues = Array.from({ length: yTickCount }, (_, i) => {
        const v = minVal - valPadding + ((valRange + valPadding * 2) / (yTickCount - 1)) * i
        return { value: Math.round(v * 10) / 10, y: scaleY(v) }
      })

      const xTickValues = data.map((d) => ({
        week: d.week,
        x: scaleX(d.week),
      }))

      return {
        points: pts,
        polyline: line,
        areaPath: area,
        yTicks: yTickValues,
        xTicks: xTickValues,
        innerWidth: iW,
        innerHeight: iH,
      }
    }, [data])

  const gradientId = `chart-gradient-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <Card>
      <CardContent>
        <h4 className="mb-3 text-sm font-semibold text-white">
          {label}{' '}
          <span className="font-normal text-steel-500">({unit})</span>
        </h4>

        {points.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-steel-500">
            No data yet
          </div>
        ) : (
          <svg
            viewBox={`0 0 600 ${CHART_HEIGHT}`}
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={i}
                x1={CHART_PADDING.left}
                y1={tick.y}
                x2={CHART_PADDING.left + innerWidth}
                y2={tick.y}
                stroke="white"
                strokeOpacity={0.06}
              />
            ))}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={i}
                x={CHART_PADDING.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-steel-500 text-[10px]"
              >
                {tick.value}
              </text>
            ))}

            {/* X-axis labels */}
            {xTicks.map((tick) => (
              <text
                key={tick.week}
                x={tick.x}
                y={CHART_HEIGHT - 5}
                textAnchor="middle"
                className="fill-steel-500 text-[10px]"
              >
                {tick.week === 0 ? 'B' : `W${tick.week}`}
              </text>
            ))}

            {/* Area fill */}
            {areaPath && (
              <path d={areaPath} fill={`url(#${gradientId})`} />
            )}

            {/* Line */}
            {polyline && (
              <path
                d={polyline}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {points.map((pt) => (
              <circle
                key={pt.week}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={color}
                stroke="rgb(var(--color-navy-950, 15 23 42))"
                strokeWidth={2}
              />
            ))}
          </svg>
        )}
      </CardContent>
    </Card>
  )
}
