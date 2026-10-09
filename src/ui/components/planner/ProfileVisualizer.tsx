import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ProfilePoint {
  time: number;
  depth: number;
  ppo2: number;
}

export function ProfileVisualizer({ points, mod }: { points: ProfilePoint[]; mod: number }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div><span className="eyebrow">PROFILE PREVIEW</span><h2>Single-gas waypoint profile</h2></div>
        <span className="muted">MOD {mod.toFixed(1)} m</span>
      </div>
      <div className="profile-chart-wrap">
        <div className="profile-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#25354b" strokeDasharray="3 3" />
              <XAxis dataKey="time" unit=" min" tick={{ fill: "#8192a8", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis reversed unit=" m" domain={[0, "auto"]} tick={{ fill: "#8192a8", fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip
                content={({ active, payload }) => {
                  const point = active && payload?.[0]?.payload as ProfilePoint | undefined;
                  return point ? (
                    <div className="chart-tooltip">
                      <strong>{point.time} min</strong>
                      <span style={{ color: "#22d3ee" }}>Depth: {point.depth.toFixed(1)} m</span>
                      <span style={{ color: "#fda4af" }}>PPO₂: {point.ppo2.toFixed(2)} bar</span>
                    </div>
                  ) : null;
                }}
              />
              <Line type="monotone" dataKey="depth" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3, fill: "#22d3ee" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
