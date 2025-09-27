import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Thermometer,
  Droplet,
  Sun,
  Cloud,
  MapPin,
  Calendar,
  Loader2,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react";

const API_KEY = "419557d8d6e1060b1e6932dff61c68ad"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const LAST_CITY_KEY = "lastSearchedCity";


function getWeatherIcon(id) {
  if (id >= 200 && id < 300)
    return <CloudLightning size={40} className="text-gray-700" />;
  if (id >= 300 && id < 600)
    return <CloudRain size={40} className="text-blue-500" />;
  if (id >= 600 && id < 700)
    return <CloudSnow size={40} className="text-cyan-500" />;
  if (id >= 700 && id < 800)
    return <CloudDrizzle size={40} className="text-gray-500" />;
  if (id === 800) return <Sun size={40} className="text-yellow-500" />;
  if (id > 800 && id < 900)
    return <Cloud size={40} className="text-gray-400" />;
  return <Thermometer size={40} className="text-red-500" />;
}

export default function App() {
  const [city, setCity] = useState("");
  const [lastCity, setLastCity] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const saved = localStorage.getItem(LAST_CITY_KEY);
    if (saved) {
      setCity(saved);
      setLastCity(saved);
      fetchWeather(saved);
    }
  }, []);

  function processForecast(list) {
    const daily = {};
    list.forEach((item) => {
      const [date, time] = item.dt_txt.split(" ");
      if (!daily[date] || time === "12:00:00" || time === "15:00:00") {
        daily[date] = item;
      }
    });

    const today = new Date().toISOString().split("T")[0];
    return Object.keys(daily)
      .sort()
      .filter((d) => d !== today)
      .slice(0, 5)
      .map((d) => daily[d]);
  }

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName) return;

    setLoading(true);
    setError(null);

    try {
      const currentRes = await fetch(
        `${BASE_URL}/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const current = await currentRes.json();
      if (!currentRes.ok || current.cod !== 200) throw new Error(current.message);

      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      setCurrentWeather(current);
      setForecast(processForecast(forecastData.list || []));
      localStorage.setItem(LAST_CITY_KEY, cityName);
      setLastCity(cityName);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const CurrentWeather = useMemo(() => {
    if (!currentWeather) return null;
    const { main, weather, name, sys } = currentWeather;
    return (
      <div className="bg-white/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl w-full transition-all duration-300">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <MapPin className="mr-2 text-indigo-500" size={24} />
            {name}, {sys.country}
          </h2>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <div className="text-7xl">{getWeatherIcon(weather[0].id)}</div>
            <div className="font-extrabold text-7xl text-gray-900">
              {Math.round(main.temp)}°C
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-3xl font-semibold capitalize text-gray-700">
              {weather[0].description}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-end">
                <Droplet className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-lg text-gray-600">
                  Humidity: {main.humidity}%
                </span>
              </div>
              <div className="flex items-center justify-end">
                <Thermometer className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-lg text-gray-600">
                  Feels Like: {Math.round(main.feels_like)}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [currentWeather]);

  const Forecast = useMemo(() => {
    if (!forecast.length) return null;
    return (
      <div className="w-full mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-indigo-500" /> 5-Day Forecast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecast.map((day, i) => (
            <div
              key={i}
              className="bg-white/40 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-md flex flex-col items-center text-center hover:shadow-indigo-400/40 hover:scale-105 transition-all duration-300"
            >
              <p className="text-sm font-semibold text-indigo-600 mb-2">
                {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </p>
              <div className="text-4xl mb-2">{getWeatherIcon(day.weather[0].id)}</div>
              <p className="text-xl font-bold text-gray-800 mb-1">
                {Math.round(day.main.temp)}°C
              </p>
              <p className="text-xs capitalize text-gray-500">
                {day.weather[0].description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }, [forecast]);

  return (
    <div className="min-h-screen bg-animated p-4 sm:p-8 font-['Inter'] text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center mb-10 drop-shadow-lg">
          Cloud Compass 🧭
        </h1>

        <form
          onSubmit={handleSearch}
          className="mb-6 bg-white/40 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg"
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={`Enter city (last: ${lastCity || "N/A"})`}
              className="flex-grow p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 font-semibold shadow-md flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <Search className="w-6 h-6 mr-1" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {loading && (
          <div className="p-6 text-center bg-yellow-100/80 rounded-xl shadow-md flex items-center justify-center text-yellow-800 font-semibold mt-4">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            Fetching weather data...
          </div>
        )}

        {error && (
          <div className="p-6 text-center bg-red-100/80 rounded-xl shadow-md text-red-700 font-semibold mt-4">
            <p className="font-bold mb-1">Oops! Something went wrong.</p>
            {error}
          </div>
        )}

        {!loading && !error && currentWeather && (
          <>
            {CurrentWeather}
            {Forecast}
          </>
        )}

        {!loading && !error && !currentWeather && lastCity && (
          <div className="p-8 text-center bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl text-gray-700 mt-4">
            <Sun className="w-12 h-12 mx-auto text-indigo-500 mb-3" />
            <p className="text-xl">
              Welcome back! Search for a new city or reload{" "}
              <span className="font-bold text-indigo-600">{lastCity}</span>.
            </p>
          </div>
        )}

        <footer className="text-center text-white/70 text-sm mt-10">
          Powered by <span className="font-semibold text-white">OpenWeather</span> 🌦️
        </footer>
      </div>
    </div>
  );
}
