// 1) IP location (no prompt)
async function getApproxLocationByIP() {
  // Cloudflare trace is not CORS friendly in many setups.
  // Use a simple JSON IP geo service:
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) throw new Error('Failed to fetch IP location');
  const data = await res.json();

  return {
    lat: Number(data.latitude),
    lon: Number(data.longitude),
  };
}

// 2) Weather via Open-Meteo
async function getWeatherCode(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=weather_code,is_day` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather');
  else(console.log('Fetched weather data'));
  const data = await res.json();

  return {
    weatherCode: data.current.weather_code,
    isDay: Boolean(data.current.is_day),
  };
}

// 3) Map Open-Meteo weather_code to our simplified states
export function mapWeatherCodeToMood(code) {
  // Open-Meteo codes: https://open-meteo.com/en/docs
  // We'll simplify to: clear | cloudy | rain | snow (snow later)
  if (code === 0) return 'clear'; // clear sky
  if ([1, 2, 3, 45, 48].includes(code)) return 'cloudy'; // mainly clear/partly/cloudy/fog
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  return 'cloudy';
}

export async function getUserWeather() {
  const { lat, lon } = await getApproxLocationByIP();
  const { weatherCode, isDay } = await getWeatherCode(lat, lon);

  return {
    weather: mapWeatherCodeToMood(weatherCode),
    timeOfDay: isDay ? 'day' : 'night',
  };
}
