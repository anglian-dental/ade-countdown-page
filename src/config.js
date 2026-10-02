/**
 * Anglian Dental deployment countdown.
 *
 * Change the deployment moment by editing DEPLOYMENT_DATE only.
 * Use a full ISO-8601 timestamp with an explicit numeric offset.
 * Do not use a date-only string such as "2026-10-26": browsers do not
 * agree on which timezone that means.
 *
 * The offset must match UK civil time on that calendar date:
 *   GMT  (after the last Sunday in October, until the last Sunday in March): +00:00
 *   BST  (after the last Sunday in March, until the last Sunday in October): +01:00
 *
 * 26 October 2026 is GMT. Clocks go back on 25 October 2026, so 09:00 UK
 * time is 09:00 UTC.
 *
 * Progress runs from midnight UK on 1 October 2026. That date is still BST.
 */
export const TIME_ZONE = "Europe/London";
export const DEPLOYMENT_DATE = "2026-10-26T09:00:00+00:00";
export const PROGRESS_START = "2026-10-01T00:00:00+01:00";

/** Minimum time the branded loading screen stays visible before the countdown. */
export const LOADING_MIN_MS = 5000;

export const LOGO_SRC = "/assets/anglian-dental-logo-dark.png";

export const deploymentMs = Date.parse(DEPLOYMENT_DATE);
export const progressStartMs = Date.parse(PROGRESS_START);

export const ukClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export const ukDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const ukHourMinute = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function remainingParts(nowMs) {
  const totalSeconds = Math.max(0, Math.floor((deploymentMs - nowMs) / 1000));
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    live: totalSeconds === 0,
  };
}

export function progressRatio(nowMs) {
  if (!Number.isFinite(deploymentMs) || !Number.isFinite(progressStartMs)) {
    return 0;
  }
  if (deploymentMs <= progressStartMs) {
    return nowMs >= deploymentMs ? 1 : 0;
  }
  if (nowMs <= progressStartMs) {
    return 0;
  }
  if (nowMs >= deploymentMs) {
    return 1;
  }
  return (nowMs - progressStartMs) / (deploymentMs - progressStartMs);
}

function phrase(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function summaryCopy(parts) {
  if (parts.live) {
    return "Deployment day. Anglian Dental deployment is now live.";
  }
  return `${phrase(parts.days, "day", "days")}, ${phrase(parts.hours, "hour", "hours")}, and ${phrase(parts.minutes, "minute", "minutes")} remaining until deployment.`;
}

export function statusCopy(ratio, live) {
  if (live) {
    return "The deployment window is complete.";
  }
  if (ratio <= 0) {
    return `Preparation begins ${ukDate.format(progressStartMs)}.`;
  }
  if (ratio >= 0.85) {
    return "Deployment approaching";
  }
  return "Deployment is getting closer...";
}
