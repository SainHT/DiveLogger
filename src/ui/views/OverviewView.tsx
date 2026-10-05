import { ArrowDown, Clock3, Plus, Thermometer, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import type { DiveLog } from "../../modules/dives/domain/dive.model";
import { getAllDives } from "../../storage/repositories/diveRepository";
import { Badge } from "../components/common/Badge";
import { BaseButton } from "../components/common/BaseButton";
import { RatingStars } from "../components/common/RatingStars";
import { StatCard } from "../components/common/StatCard";

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

export function OverviewView({
  onNewDive,
  onDive,
  onLogbook,
}: {
  onNewDive: () => void;
  onDive: (dive: DiveLog) => void;
  onLogbook: () => void;
}) {
  const [dives, setDives] = useState<DiveLog[]>([]);
  useEffect(() => {
    void getAllDives().then(setDives);
  }, []);
  const bottomTime = dives.reduce((total, dive) => total + dive.duration, 0);
  const maxDepth = dives.reduce(
    (max, dive) => Math.max(max, dive.maxDepthMeters),
    0,
  );
  const coldest = dives.reduce<number | undefined>(
    (min, dive) =>
      dive.minWaterTempCelsius == null
        ? min
        : min == null
          ? dive.minWaterTempCelsius
          : Math.min(min, dive.minWaterTempCelsius),
    undefined,
  );
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">DIVE OPERATIONS / OVERVIEW</span>
          <h1>Good to see you, diver.</h1>
          <p className="muted">Your local logbook at a glance.</p>
        </div>
        <BaseButton onClick={onNewDive}>
          <Plus size={17} /> Log New Dive
        </BaseButton>
      </section>
      <section className="stat-grid">
        <StatCard
          label="Total dives"
          value={dives.length}
          icon={<Waves size={18} />}
        />
        <StatCard
          label="Bottom time"
          value={formatDuration(bottomTime)}
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Max depth"
          value={`${maxDepth.toFixed(1)} m`}
          icon={<ArrowDown size={18} />}
        />
        <StatCard
          label="Coldest temp"
          value={coldest == null ? "—" : `${coldest.toFixed(1)} °C`}
          icon={<Thermometer size={18} />}
        />
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LOGBOOK / RECENT</span>
            <h2>Recent dives</h2>
          </div>
          <button className="text-button" onClick={onLogbook}>
            View all dives →
          </button>
        </div>
        <div className="dive-feed">
          {dives.slice(0, 3).map((dive) => (
            <button
              className="dive-row"
              key={dive.id}
              onClick={() => onDive(dive)}
            >
              <div className="dive-date">
                <strong>{formatDate(dive.date)}</strong>
                <span>{dive.siteName}</span>
              </div>
              <div className="dive-location">{dive.location}</div>
              <div className="dive-measure">
                <strong>{dive.maxDepthMeters.toFixed(1)} m</strong>
                <span>{Math.round(dive.duration / 60)} min</span>
              </div>
              <div>
                <Badge>{dive.gasMix}</Badge>
                <span className="type-label">{dive.diveType}</span>
              </div>
              <RatingStars value={dive.rating} />
            </button>
          ))}
          {dives.length === 0 && (
            <div className="empty-state">
              Your first dive is waiting to be logged.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
