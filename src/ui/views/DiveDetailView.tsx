import { ArrowLeft, CalendarDays, Edit3, MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  DiveLog,
  DiveProfileSample,
} from "../../modules/dives/domain/dive.model";
import { generateMockProfile } from "../../modules/telemetry/utils/mockProfileGenerator";
import { deleteDive } from "../../storage/repositories/diveRepository";
import {
  getProfileSamples,
  saveProfileSamples,
} from "../../storage/repositories/profileRepository";
import { BaseButton } from "../components/common/BaseButton";
import { RatingStars } from "../components/common/RatingStars";
import { DepthProfileChart } from "../components/charts/DepthProfileChart";
import { calculateSAC } from "../../modules/physics/utils/gasCalculations";

const value = (item: number | string | undefined, suffix = "") =>
  item == null || item === "" ? "—" : `${item}${suffix}`;
export function DiveDetailView({
  dive,
  onBack,
  onEdit,
  onDeleted,
}: {
  dive: DiveLog;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [samples, setSamples] = useState<DiveProfileSample[]>([]);
  useEffect(() => {
    void (async () => {
      const storedSamples = await getProfileSamples(dive.id);
      if (storedSamples.length > 0 || dive.diveNumber !== 1) {
        setSamples(storedSamples);
        return;
      }

      const mockSamples = generateMockProfile(dive.id, {
        durationSeconds: dive.duration,
        maxDepthMeters: dive.maxDepthMeters,
        startPressureBar: dive.startPressureBar,
        endPressureBar: dive.endPressureBar,
        surfaceTemperatureCelsius: dive.maxWaterTempCelsius ?? 25,
      });
      await saveProfileSamples(mockSamples);
      setSamples(mockSamples);
    })();
  }, [
    dive.diveNumber,
    dive.duration,
    dive.endPressureBar,
    dive.id,
    dive.maxDepthMeters,
    dive.maxWaterTempCelsius,
    dive.startPressureBar,
  ]);
  const remove = async () => {
    if (window.confirm("Delete this dive from your logbook?")) {
      await deleteDive(dive.id);
      onDeleted();
    }
  };
  const consumption = calculateSAC({
    startPressureBar: dive.startPressureBar,
    endPressureBar: dive.endPressureBar,
    durationMinutes: dive.duration / 60,
    avgDepthMeters: dive.avgDepthMeters ?? dive.maxDepthMeters,
    tankCapacityLiters: dive.tankCapacityLiters,
  });
  return (
    <div className="page-stack">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to logbook
      </button>
      <section className="detail-heading">
        <div>
          <span className="eyebrow">
            DIVE #{dive.diveNumber.toString().padStart(3, "0")}
          </span>
          <h1>{dive.siteName}</h1>
          <div className="detail-meta">
            <span>
              <MapPin size={15} /> {dive.location}
            </span>
            <span>
              <CalendarDays size={15} />{" "}
              {new Date(dive.date).toLocaleDateString()}
            </span>
            <span>Buddy: {dive.buddy || "—"}</span>
            <span>{dive.waterType ?? "—"} water</span>
          </div>
        </div>
        <div className="detail-actions">
          <RatingStars value={dive.rating} />
          <BaseButton variant="secondary" onClick={onEdit}>
            <Edit3 size={16} /> Edit
          </BaseButton>
          <BaseButton variant="danger" onClick={() => void remove()}>
            <Trash2 size={16} /> Delete
          </BaseButton>
        </div>
      </section>
      {samples.length > 0 && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TELEMETRY</span>
              <h2>Depth profile</h2>
            </div>
            <span className="muted">{samples.length} samples</span>
          </div>
          <DepthProfileChart samples={samples} />
        </section>
      )}
      <section className="detail-stats">
        <DetailStat
          label="Max depth"
          value={value(dive.maxDepthMeters, " m")}
        />
        <DetailStat
          label="Avg depth"
          value={value(dive.avgDepthMeters, " m")}
        />
        <DetailStat
          label="Duration"
          value={`${Math.floor(dive.duration / 60)} min`}
        />
        <DetailStat label="Gas mix" value={dive.gasMix} />
        <DetailStat
          label="Tank pressure"
          value={`${dive.startPressureBar} → ${dive.endPressureBar} bar`}
        />
        <DetailStat
          label="SAC"
          value={`${consumption.sacBarMin.toFixed(2)} bar/min`}
        />
      </section>
      <section className="info-grid">
        <InfoBlock title="Environment">
          <InfoLine
            label="Water temperature"
            value={`${value(dive.maxWaterTempCelsius, "°")} / ${value(dive.minWaterTempCelsius, "°")} / ${value(dive.avgWaterTempCelsius, "°")} C (max / min / avg)`}
          />
          <InfoLine
            label="Visibility"
            value={value(dive.visibilityMeters, " m")}
          />
          <InfoLine label="Weather" value={value(dive.weather)} />
          <InfoLine label="Conditions" value={value(dive.specialConditions)} />
        </InfoBlock>
        <InfoBlock title="Gear & setup">
          <InfoLine
            label="Tank"
            value={`${dive.tankType}, ${value(dive.tankCapacityLiters, " L")}`}
          />
          <InfoLine label="Weight" value={value(dive.weightKg, " kg")} />
          <InfoLine label="Suit" value={value(dive.suitType)} />
          <InfoLine label="Equipment" value={value(dive.specialEquipment)} />
        </InfoBlock>
      </section>
      <section className="notes panel">
        <span className="eyebrow">PERSONAL NOTES</span>
        <p>{dive.notes || "No notes recorded for this dive."}</p>
      </section>
    </div>
  );
}
function DetailStat({
  label,
  value: statValue,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-stat">
      <span className="eyebrow">{label}</span>
      <strong>{statValue}</strong>
    </div>
  );
}
function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="info-block">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
function InfoLine({
  label,
  value: lineValue,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="info-line">
      <span>{label}</span>
      <strong>{lineValue}</strong>
    </div>
  );
}
