export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

/**
 * Calls `onChange(next)` whenever day/night changes.
 * Checks every `intervalMs`.
 */
export function startTimeWatcher(onChange, intervalMs = 60_000) {
  let current = getTimeOfDay();

  // Run once immediately
  onChange(current, { initial: true });

  const id = window.setInterval(() => {
    const next = getTimeOfDay();
    if (next !== current) {
      current = next;
      onChange(next, { initial: false });
    }
  }, intervalMs);

  return () => window.clearInterval(id);
}
