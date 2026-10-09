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

interface ProfileMetrics {
  ndl: number;
  mod: number;
  ead: number;
  gfLow: number;
  gfHigh: number;
  ppo2: number;
}

export function ProfileVisualizer({ points, metrics }: { points: ProfilePoint[]; metrics: ProfileMetrics }) {
  const isPPO2Warning = metrics.ppo2 >= 1.35;

  return (
    <section className={isPPO2Warning ? "panel planner-profile planner-profile-warning" : "panel planner-profile"}>
      <div className="section-heading">
        <div><span className="eyebrow">PROFILE PREVIEW</span><h2>Single-gas waypoint profile</h2></div>
        <span className={isPPO2Warning ? "planner-ppo2-badge warning" : "planner-ppo2-badge"}>
          PPO₂ {metrics.ppo2.toFixed(2)} bar {isPPO2Warning ? "· Near limit" : "· Safe"}
        </span>
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
      <div className="planner-profile-metrics">
        <div><span className="eyebrow">NDL</span><strong>{metrics.ndl} min</strong></div>
        <div><span className="eyebrow">MOD</span><strong>{metrics.mod.toFixed(1)} m</strong></div>
        <div><span className="eyebrow">EAD</span><strong>{metrics.ead.toFixed(1)} m</strong></div>
        <div><span className="eyebrow">GF LOW / HIGH</span><strong>{Math.round(metrics.gfLow * 100)} / {Math.round(metrics.gfHigh * 100)}%</strong></div>
      </div>
    </section>
  );
}
