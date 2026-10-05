export type ChartSeries = 'depth' | 'temperature' | 'pressure';

const SERIES: Array<{ key: ChartSeries; label: string; color: string }> = [
  { key: 'depth', label: 'Depth', color: '#22d3ee' },
  { key: 'temperature', label: 'Temperature', color: '#fb923c' },
  { key: 'pressure', label: 'Pressure', color: '#f8fafc' },
];

export function ChartSeriesToggles({
  visible,
  onChange,
}: {
  visible: Record<ChartSeries, boolean>;
  onChange: (series: ChartSeries, isVisible: boolean) => void;
}) {
  return (
    <div className="chart-series-toggles" aria-label="Chart series visibility">
      {SERIES.map((series) => (
        <label className="chart-series-toggle" key={series.key}>
          <input
            type="checkbox"
            checked={visible[series.key]}
            onChange={(event) => onChange(series.key, event.target.checked)}
          />
          <span className="series-swatch" style={{ backgroundColor: series.color }} />
          {series.label}
        </label>
      ))}
    </div>
  );
}
