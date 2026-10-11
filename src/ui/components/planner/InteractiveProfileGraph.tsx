import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProfileSample } from "../../../modules/physics/utils/profilePlanner";

interface Props {
  samples: ProfileSample[];
  maxDepth: number;
  hasDeepStop: boolean;
  deepStopDepth: number | null;
  safetyStopDuration: number;
}

function StopLabel({ x = 0, y = 0, text, color }: { x?: number; y?: number; text: string; color: string }) {
  const width = text.length * 6.2 + 12;
  return (
    <g pointerEvents="none">
      <rect x={x + 8} y={y - 20} width={width} height={16} rx={3} fill="#081321" stroke={color} strokeOpacity={0.8} />
      <text x={x + 14} y={y - 9} fill={color} fontSize={10} fontFamily="DM Mono, monospace" fontWeight={600}>
        {text}
      </text>
    </g>
  );
}

export function InteractiveProfileGraph({ samples, maxDepth, hasDeepStop, deepStopDepth, safetyStopDuration }: Props) {
  if (samples.length === 0) return null;

  return (
    <div className="planner-interactive-graph">
      <div className="profile-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={samples} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="planner-profile-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#25354b" strokeDasharray="3 3" />
            <XAxis dataKey="timeMinutes" type="number" domain={["dataMin", "dataMax"]} unit=" min" tick={{ fill: "#8192a8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis reversed domain={[0, Math.max(10, maxDepth + 5)]} unit=" m" tick={{ fill: "#8192a8", fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
            {hasDeepStop && deepStopDepth != null && (
              <ReferenceLine
                y={deepStopDepth}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={<StopLabel text={`${deepStopDepth}m Deep Stop (1 min)`} color="#fbbf24" />}
              />
            )}
            <ReferenceLine
              y={5}
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={<StopLabel text={`5m Safety Stop (${safetyStopDuration} min)`} color="#34d399" />}
            />
            <Tooltip
              content={({ active, payload }) => {
                const point = active && payload?.[0]?.payload as ProfileSample | undefined;
                return point ? (
                  <div className="chart-tooltip">
                    <strong>{point.phase}</strong>
                    <span>Time: {point.timeMinutes.toFixed(1)} min</span>
                    <span>Depth: {point.depthMeters.toFixed(1)} m</span>
                    {point.note && <span>{point.note}</span>}
                  </div>
                ) : null;
              }}
            />
            <Area type="monotone" dataKey="depthMeters" stroke="#22d3ee" strokeWidth={2.5} fill="url(#planner-profile-gradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="planner-waypoint-badges">
        {hasDeepStop && <span className="planner-waypoint-badge deep">Deep Stop · {deepStopDepth}m · 1 min</span>}
        <span className="planner-waypoint-badge safety">Safety Stop · 5m · {safetyStopDuration} min</span>
      </div>
    </div>
  );
}
