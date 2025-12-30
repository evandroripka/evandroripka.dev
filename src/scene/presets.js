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
    }
  }
};
