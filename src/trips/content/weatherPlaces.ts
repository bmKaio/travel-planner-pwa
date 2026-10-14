import type { WeatherPlace } from '../domain/weather'

const place = (name: string, latitude: number, longitude: number): [string, WeatherPlace] => [
  name,
  { name, latitude, longitude },
]

// Coordinates of the cities the header forecast can show, keyed by the city names used in the
// trip days (`cities`). Source: Open-Meteo geocoding API (Aguas Calientes: Wikipedia, as the API
// does not list it). Cities missing here are skipped, so every trip day needs at least one.
// Not stored in TripsDB: adding a place needs no seedVersion bump.
export const WEATHER_PLACES: Record<string, WeatherPlace> = Object.fromEntries([
  place('Madrid', 40.4165, -3.7026),
  place('Lima', -12.0432, -77.0282),
  place('Arequipa', -16.399, -71.5375),
  place('Chivay', -15.6383, -71.6011),
  place('Yanque', -15.6492, -71.6578),
  place('Puno', -15.84, -70.022),
  place('Cusco', -13.5319, -71.967),
  place('Aguas Calientes', -13.1547, -72.5254),
])
