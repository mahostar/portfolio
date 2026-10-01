export function motionAllowed() {
  return (
    document.documentElement.dataset.motion !== "paused" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function setMotionPaused(paused: boolean) {
  document.documentElement.dataset.motion = paused ? "paused" : "running";
  try {
    localStorage.setItem("portfolio-motion", paused ? "paused" : "running");
  } catch {
    /* Storage can be disabled without affecting the switch. */
  }
}
