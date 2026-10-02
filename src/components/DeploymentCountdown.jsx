import { useEffect, useRef, useState } from "react";
import {
  deploymentMs,
  progressRatio,
  progressStartMs,
  remainingParts,
  statusCopy,
  summaryCopy,
  ukClock,
  ukDate,
  ukHourMinute,
} from "../config.js";

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

const configured = Number.isFinite(deploymentMs) && Number.isFinite(progressStartMs);

function useNow() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(Date.now());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => window.clearTimeout(timer);
  }, []);

  return now;
}

function useSummary(parts) {
  const key = parts.live
    ? "live"
    : `${parts.days}-${parts.hours}-${parts.minutes}`;
  const announced = useRef("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (announced.current === key) {
      return;
    }
    announced.current = key;
    setSummary(summaryCopy(parts));
  }, [key, parts]);

  return summary;
}

function allowTilt() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function CountCard({ label, value, ring }) {
  const text = String(value).padStart(2, "0");

  function tilt(event) {
    if (!allowTilt()) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
  }

  function resetTilt(event) {
    event.currentTarget.style.transform = "";
  }

  return (
    <article
      className="card"
      style={{ "--ring": `${Math.round(ring * 360)}deg` }}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
    >
      <span className="card-glow" aria-hidden="true" />
      <span key={text} className="card-value" aria-hidden="true">
        {text}
      </span>
      <span className="card-label">{label}</span>
    </article>
  );
}

function unitRings(parts, ratio) {
  return {
    days: ratio,
    hours: parts.hours / 24,
    minutes: parts.minutes / 60,
    seconds: parts.seconds / 60,
  };
}

export default function DeploymentCountdown() {
  const now = useNow();
  const parts = remainingParts(now);
  const ratio = progressRatio(now);
  const summary = useSummary(parts);
  const percent = parts.live ? 100 : Math.min(99, Math.floor(ratio * 100));
  const rings = unitRings(parts, parts.live ? 1 : ratio);
  const deploymentLabel = configured ? ukDate.format(deploymentMs) : "Date unavailable";
  const deploymentClock = configured ? `${ukHourMinute.format(deploymentMs)} UK` : "";

  function trackPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--px", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--py", `${event.clientY - rect.top}px`);
  }

  function resetPointer(event) {
    event.currentTarget.style.removeProperty("--px");
    event.currentTarget.style.removeProperty("--py");
  }

  return (
    <main
      className="screen"
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
    >
      <div className="backdrop" aria-hidden="true">
        <span className="grid" />
        <span className="radar" />
        <span className="glow glow-top" />
        <span className="glow glow-side" />
        <span className="hex hex-a" />
        <span className="hex hex-b" />
        <span className="hex hex-c" />
        <span className="hex hex-d" />
      </div>

      <div className="stage">
        <header className="brand">
          <div className="brand-mark">
            <img
              src="/assets/anglian-dental-logo-dark.png"
              alt="Anglian Dental. Design, Build, Equip, Maintain."
              width="946"
              height="864"
            />
          </div>
          <p className="kicker">
            <span>Deployment countdown</span>
          </p>
          <h1>Deployment Day</h1>
          <p className="when">
            <span>{deploymentLabel}</span>
            {deploymentClock ? (
              <>
                <span className="when-sep" aria-hidden="true">
                  ·
                </span>
                <span>{deploymentClock}</span>
              </>
            ) : null}
          </p>
        </header>

        <section className="countdown" aria-labelledby="countdown-title">
          <h2 id="countdown-title" className="visually-hidden">
            Time remaining until deployment
          </h2>
          <span className="bracket bracket-tl" aria-hidden="true" />
          <span className="bracket bracket-tr" aria-hidden="true" />
          <span className="bracket bracket-bl" aria-hidden="true" />
          <span className="bracket bracket-br" aria-hidden="true" />

          {parts.live ? (
            <div className="live-banner">
              <p className="live-title">DEPLOYMENT DAY</p>
              <p className="live-copy">Anglian Dental deployment is now live.</p>
            </div>
          ) : (
            <div className="cards" aria-hidden="true">
              {UNITS.map((unit) => (
                <CountCard
                  key={unit.key}
                  label={unit.label}
                  value={parts[unit.key]}
                  ring={rings[unit.key]}
                />
              ))}
            </div>
          )}

          <p className="visually-hidden" aria-live="polite">
            {configured
              ? summary
              : "The deployment time could not be read. Check the configuration constants."}
          </p>
        </section>

        <section className="progress" aria-labelledby="progress-heading">
          <div className="progress-head">
            <h2 id="progress-heading">
              {parts.live ? "Deployment complete" : "Preparing for deployment"}
            </h2>
            <p className="progress-percent">{percent}%</p>
          </div>
          <div
            className="bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-labelledby="progress-heading"
          >
            <div
              className="bar-fill"
              style={{ width: `${parts.live ? 100 : ratio * 100}%` }}
            />
            <div className="bar-segments" aria-hidden="true" />
          </div>
          <p className="status">
            {configured ? statusCopy(ratio, parts.live) : "Deployment time is not configured."}
          </p>
        </section>

        <footer className="clock">
          <p className="clock-label">Current UK time</p>
          <time className="clock-value" dateTime={new Date(now).toISOString()}>
            {ukClock.format(now)}
          </time>
          <p className="tz">UK time · Europe/London</p>
        </footer>
      </div>
    </main>
  );
}
