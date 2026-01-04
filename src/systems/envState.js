export function createEnvState(initial = {}) {
  return {
    timeOfDay: initial.timeOfDay ?? 'night', // 'day' | 'night'
    weather: initial.weather ?? 'clear',     // 'clear' | 'cloudy' | 'rain' | 'snow'

    set(next) {
      Object.assign(this, next);
    },

    presetKey() {
      // currently only rain has dedicated presets
      return this.weather === 'rain'
        ? `${this.timeOfDay}_rain`
        : this.timeOfDay;
    },
  };
}
