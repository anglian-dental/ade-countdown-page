import { useEffect, useRef, useState } from "react";
import { LOADING_MIN_MS, LOGO_SRC } from "../config.js";

const STEPS = [
  "Synchronising UK time",
  "Loading go-live schedule",
  "Preparing display",
];

function preloadLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = LOGO_SRC;
    if (img.complete) {
      resolve(true);
    }
  });
}

export default function LoadingScreen({ leaving, onDone }) {
  const [step, setStep] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const started = Date.now();
    let cancelled = false;

    const minimumHold = new Promise((resolve) => {
      window.setTimeout(resolve, LOADING_MIN_MS);
    });

    Promise.all([minimumHold, preloadLogo()]).then(() => {
      if (cancelled || done.current) {
        return;
      }
      done.current = true;
      onDone(Date.now() - started);
    });

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  useEffect(() => {
    const interval = LOADING_MIN_MS / STEPS.length;
    const timer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, interval);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main
      className={`screen loader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      style={{ "--loading-ms": `${LOADING_MIN_MS}ms` }}
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

      <div className="stage loader-stage">
        <div className="brand-mark loader-mark">
          <img
            src={LOGO_SRC}
            alt="Anglian Dental. Design, Build, Equip, Maintain."
            width="946"
            height="864"
          />
        </div>

        <p className="kicker">
          <span>Initialising go-live countdown</span>
        </p>

        <div className="loader-line" aria-hidden="true">
          <div className="loader-fill" />
          <div className="bar-segments" />
        </div>

        <p className="loader-step" key={step}>
          {STEPS[step]}
        </p>

        <p className="tz">UK time · Europe/London</p>
      </div>
    </main>
  );
}
