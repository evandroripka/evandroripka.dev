export const ENV_PRESETS = {
  day: {
    background: 0xbfdcff,
    ambientIntensity: 0.9,
    directionalIntensity: 1.2,
    directionalColor: 0xffffff,
    fog: {
      color: 0xbfdcff,
      near: 10,
      far: 40
    }
  },

  night: {
    background: 0x39003f,
    ambientIntensity: 0.25,
    directionalIntensity: 0.6,
    directionalColor: 0x6aa8ff,
    fog: {
      color: 0xd68ede,
      near: 5,
      far: 25
    },

    day_rain: {
      background: 0x8ea3b2,
      ambientIntensity: 0.7,
      directionalIntensity: 0.9,
      directionalColor: 0xcfe6ff,
      fog: { color: 0x8ea3b2, near: 6, far: 22 }
    },

    night_rain: {
      background: 0x070a10,
      ambientIntensity: 0.18,
      directionalIntensity: 0.45,
      directionalColor: 0x4f86ff,
      fog: { color: 0x070a10, near: 3, far: 16 }
    },
  }
};
