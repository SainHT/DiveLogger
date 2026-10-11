import { calculateNDL } from "../../../modules/physics/engine/buhlmann";

interface Props {
  depths: number[];
  selectedDepth: number;
  fO2: number;
  gradientFactorHigh: number;
  onSelect: (depth: number) => void;
}

export function NdlLookupTable({ depths, selectedDepth, fO2, gradientFactorHigh, onSelect }: Props) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div><span className="eyebrow">NDL TABLE</span><h2>Limits by depth</h2></div>
        <span className="muted">GF High {Math.round(gradientFactorHigh * 100)}%</span>
      </div>
      <div className="planner-depths">
        {depths.map((depth) => (
          <button
            type="button"
            className={depth === selectedDepth ? "planner-depth selected" : "planner-depth"}
            key={depth}
            onClick={() => onSelect(depth)}
          >
            <span>{depth} m</span>
            <strong>{calculateNDL(depth, fO2, gradientFactorHigh)} min</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
