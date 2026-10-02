import { useCallback, useEffect, useState } from "react";
import DeploymentCountdown from "./components/DeploymentCountdown.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

const FADE_MS = 600;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function App() {
  const [phase, setPhase] = useState("loading");

  const handleLoaded = useCallback(() => {
    setPhase(reducedMotion() ? "ready" : "leaving");
  }, []);

  useEffect(() => {
    if (phase !== "leaving") {
      return undefined;
    }
    const timer = window.setTimeout(() => setPhase("ready"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "ready") {
    return <DeploymentCountdown entering />;
  }

  return <LoadingScreen leaving={phase === "leaving"} onDone={handleLoaded} />;
}
