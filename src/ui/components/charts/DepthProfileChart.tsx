import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DiveProfileSample } from '../../../modules/dives/domain/dive.model';

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export function DepthProfileChart({ samples }: { samples: DiveProfileSample[] }) {
  const gradientId = useId().replaceAll(':', '');
  const data = samples.map((sample) => ({ ...sample, time: formatTime(sample.timestampSeconds) }));
  return <div className="profile-chart">
    {data.length === 0 ? <div className="empty-chart">No profile samples recorded for this dive.</div> : <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.65} /><stop offset="100%" stopColor="#0891b2" stopOpacity={0.05} /></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#25354b" />
        <XAxis dataKey="time" tick={{ fill: '#7f91a8', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis reversed unit="m" tick={{ fill: '#7f91a8', fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
        <Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="chart-tooltip"><strong>{payload[0].payload.time}</strong><span>Depth: {payload[0].payload.depthMeters} m</span>{payload[0].payload.pressureBar != null && <span>Pressure: {payload[0].payload.pressureBar} bar</span>}</div> : null} />
        <Area type="monotone" dataKey="depthMeters" stroke="#22d3ee" strokeWidth={2} fill={`url(#${gradientId})`} connectNulls />
      </AreaChart>
    </ResponsiveContainer>}
  </div>;
}