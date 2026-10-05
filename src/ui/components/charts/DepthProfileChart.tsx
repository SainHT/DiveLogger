import { useId, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DiveProfileSample } from '../../../modules/dives/domain/dive.model';
import { ChartSeriesToggles, type ChartSeries } from './ChartSeriesToggles';

const COLORS = { depth: '#22d3ee', temperature: '#fb923c', pressure: '#f8fafc' };
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

function ProfileTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DiveProfileSample & { time: string } }> }) {
  const sample = active && payload?.[0]?.payload;
  if (!sample) return null;
  return (
    <div className="chart-tooltip">
      <strong>{sample.time}</strong>
      <span style={{ color: COLORS.depth }}>Depth: {sample.depthMeters.toFixed(1)} m</span>
      {sample.temperatureCelsius != null && <span style={{ color: COLORS.temperature }}>Temp: {sample.temperatureCelsius.toFixed(1)} °C</span>}
      {sample.pressureBar != null && <span style={{ color: COLORS.pressure }}>Pressure: {sample.pressureBar} bar</span>}
    </div>
  );
}

export function DepthProfileChart({ samples }: { samples: DiveProfileSample[] }) {
  const gradientId = `depth-gradient-${useId().replaceAll(':', '')}`;
  const [visible, setVisible] = useState<Record<ChartSeries, boolean>>({
    depth: true,
    temperature: true,
    pressure: true,
  });
  const data = samples.map((sample) => ({ ...sample, time: formatTime(sample.timestampSeconds) }));

  return (
    <div className="profile-chart-wrap">
      <div className="profile-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 14, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.depth} stopOpacity={0.62} />
                <stop offset="100%" stopColor={COLORS.depth} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#25354b" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#8192a8', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis yAxisId="depth" reversed unit="m" domain={[0, 'auto']} tick={{ fill: '#8192a8', fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
            <YAxis yAxisId="temperature" orientation="right" unit="°C" tick={{ fill: COLORS.temperature, fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
            <YAxis yAxisId="pressure" orientation="right" hide domain={[0, 'auto']} />
            <Tooltip content={<ProfileTooltip />} />
            {visible.depth && <Area yAxisId="depth" type="monotone" dataKey="depthMeters" stroke={COLORS.depth} strokeWidth={2} fill={`url(#${gradientId})`} connectNulls />}
            {visible.temperature && <Line yAxisId="temperature" type="monotone" dataKey="temperatureCelsius" stroke={COLORS.temperature} strokeWidth={1.5} dot={false} connectNulls />}
            {visible.pressure && <Line yAxisId="pressure" type="monotone" dataKey="pressureBar" stroke={COLORS.pressure} strokeWidth={1.5} dot={false} connectNulls />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartSeriesToggles
        visible={visible}
        onChange={(series, isVisible) => setVisible((current) => ({ ...current, [series]: isVisible }))}
      />
    </div>
  );
}
