import React, { useState, useEffect } from 'react';

const API_KEY = '416d37e46c0f4ddce43f4272957bbea6'; // Replace with your OpenWeatherMap API key

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' for C, 'imperial' for F
  const [now, setNow] = useState(new Date());

  // Live time updater
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: get background class based on weather
  const getBgClass = (weather) => {
    if (!weather) return 'from-blue-900 via-indigo-700 to-blue-400';
    const main = weather.weather[0].main;
    switch (main) {
      case 'Rain':
      case 'Drizzle':
        return 'from-gray-900 via-blue-800 to-blue-400';
      case 'Thunderstorm':
        return 'from-gray-900 via-purple-900 to-yellow-200';
      case 'Snow':
        return 'from-blue-100 via-white to-blue-400';
      case 'Clear':
        return 'from-yellow-300 via-orange-400 to-blue-500';
      case 'Clouds':
        return 'from-gray-400 via-gray-600 to-gray-900';
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return 'from-gray-200 via-gray-400 to-gray-700';
      default:
        return 'from-blue-900 via-indigo-700 to-blue-400';
    }
  };

  // Helper: get overlay for dramatic effect
  const getOverlay = (weather) => {
    if (!weather) return null;
    const main = weather.weather[0].main;
    switch (main) {
      case 'Rain':
      case 'Drizzle':
        // Animated rain lines
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute top-0 left-0 w-0.5 h-16 bg-white/30 animate-rain" style={{left: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s`}} />
            ))}
          </div>
        );
      case 'Thunderstorm':
        // Flashing lightning
        return (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="w-full h-full animate-lightning bg-white/10" />
          </div>
        );
      case 'Snow':
        // Animated snowflakes
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full opacity-70 animate-snow" style={{left: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s`}} />
            ))}
          </div>
        );
      case 'Clear':
        // Sun rays
        return (
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-yellow-200 opacity-30 blur-2xl animate-pulse" />
          </div>
        );
      case 'Clouds':
        // Moving clouds
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute top-0 left-0 w-40 h-16 bg-white/40 rounded-full blur-2xl animate-cloud" style={{top: `${10 + i*15}%`, left: `${i*20}%`, animationDelay: `${i*1.2}s`}} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // Fetch weather by city name
  const fetchWeather = async (cityName, unitType = unit) => {
    if (!cityName) return;
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);
    try {
      // Fetch current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${unitType}`
      );
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();
      setWeather(data);
      // Fetch 5-day forecast
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${unitType}`
      );
      if (!resForecast.ok) throw new Error('Forecast not found');
      const dataForecast = await resForecast.json();
      const daily = dataForecast.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
      setForecast(daily);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon, unitType = unit) => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);
    try {
      // Current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitType}`
      );
      if (!res.ok) throw new Error('Location weather not found');
      const data = await res.json();
      setWeather(data);
      setCity(data.name);
      // Forecast
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unitType}`
      );
      if (!resForecast.ok) throw new Error('Location forecast not found');
      const dataForecast = await resForecast.json();
      const daily = dataForecast.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
      setForecast(daily);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount, try geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeatherByCoords(latitude, longitude, unit);
        },
        (err) => {
          // If denied, do nothing (user can search)
        }
      );
    }
    // eslint-disable-next-line
  }, [unit]);

  const handleInputChange = (e) => setCity(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchWeather(city, unit);
  };
  const handleSearchClick = () => fetchWeather(city, unit);
  const handleToggleUnit = () => setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));

  // Helper to get day name from date string
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  // Helper to get unit symbol
  const tempSymbol = unit === 'metric' ? '°C' : '°F';
  const windSymbol = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br transition-colors duration-700 ${getBgClass(weather)}`}>
      {getOverlay(weather)}
      <div className="relative z-10 w-full max-w-2xl p-4 sm:p-8 bg-white/30 rounded-xl shadow-xl backdrop-blur-md flex flex-col gap-6">
        {/* DateTimeDisplay */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-800 text-lg font-medium" id="date-time">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} <span className="text-sm">{now.toLocaleDateString()}</span>
          </div>
          {/* TempToggle */}
          <button
            className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-300 hover:bg-blue-200 transition"
            onClick={handleToggleUnit}
          >
            {unit === 'metric' ? '°C' : '°F'} / {unit === 'metric' ? '°F' : '°C'}
          </button>
        </div>
        {/* SearchBar */}
        <div className="w-full flex justify-center gap-2">
          <input
            className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Search city..."
            value={city}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
            onClick={handleSearchClick}
            disabled={loading}
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
        {/* Error message */}
        {error && <div className="text-red-600 text-center">{error}</div>}
        {/* WeatherCurrent */}
        {weather && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
              alt={weather.weather[0].description}
              className="w-20 h-20"
            />
            <div className="text-4xl font-bold text-gray-900">{Math.round(weather.main.temp)}{tempSymbol}</div>
            <div className="text-md text-gray-700">{weather.weather[0].main}</div>
            <div className="flex gap-4 text-gray-600 text-sm">
              <span>Wind: {weather.wind.speed} {windSymbol}</span>
              <span>Humidity: {weather.main.humidity}%</span>
            </div>
          </div>
        )}
        {/* WeatherForecast */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {forecast.length > 0 ? forecast.map((item, i) => (
            <div key={i} className="bg-white/60 rounded-lg p-2 flex flex-col items-center shadow-sm">
              <img
                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                alt={item.weather[0].description}
                className="w-8 h-8 mb-1"
              />
              <div className="text-sm font-semibold">{Math.round(item.main.temp_min)}{tempSymbol} / {Math.round(item.main.temp_max)}{tempSymbol}</div>
              <div className="text-xs text-gray-500">{getDayName(item.dt_txt)}</div>
            </div>
          )) : [...Array(5)].map((_,i) => (
            <div key={i} className="bg-white/60 rounded-lg p-2 flex flex-col items-center shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full mb-1 animate-pulse" />
              <div className="text-sm font-semibold">--{tempSymbol}</div>
              <div className="text-xs text-gray-500">Day</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tailwind custom animations (add to tailwind.config.js if not present):
// rain: {
//   '0%': { transform: 'translateY(-100%)' },
//   '100%': { transform: 'translateY(100vh)' },
// }
// snow: {
//   '0%': { transform: 'translateY(-100%)' },
//   '100%': { transform: 'translateY(100vh)' },
// }
// cloud: {
//   '0%': { transform: 'translateX(-50vw)' },
//   '100%': { transform: 'translateX(100vw)' },
// }
// lightning: {
//   '0%, 97%, 100%': { opacity: 0 },
//   '98%': { opacity: 1 },
//   '99%': { opacity: 0 },
// }

export default App;
