import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv'
import { pool } from './db'
import { error } from 'console';
import { RequestHandler } from 'express';
import cron from 'node-cron';
import { promises as fs } from 'fs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public", { extensions: ["html"] }));
app.use(express.json());

// use HTTP Authorization header standard RFC6750
const checkSecretWord: RequestHandler = (req, res, next): void => {
  const authorisation = req.get('Authorization');
  if (!authorisation) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const token = authorisation.slice(7);
  if (token != process.env.SECRET_WORD) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') return next();
  return checkSecretWord(req, res, next);
});

const tableNameWhiteList = new Set(['node_data',]);

const valueNameWhiteList = new Set(['temperature', 'humidity', 'soil_moisture',
  'wind_speed', 'gust_speed', 'rssi0', 'rssi1', 'snr0', 'snr1', 'ts', '*',
  'node_name', 'node_deployment_id'
]);

const nodeNameWhiteList = new Set([1, 2]);

app.post('/api/database/insert-node-data', async (req: Request, res: Response) => {
  const {
    device_id,
    packet_id,
    temperature,
    humidity,
    soil_moisture,
    wind_speed,
    gust_speed,
    rssi0,
    rssi1,
    snr0,
    snr1,
  } = req.body;

  try {
    const query = `INSERT INTO node_data 
      (node_deployment_id, farm_id, packet_id, temperature, humidity, 
      soil_moisture, wind_speed, gust_speed, rssi0, rssi1, snr0, snr1, node_name)
      VALUES (
      (SELECT id FROM node_deployment WHERE node_name = $11 ORDER BY ts DESC LIMIT 1),
      (SELECT farm_id FROM node_deployment WHERE node_name = $11 ORDER BY ts DESC LIMIT 1),
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);`;
    const values = [
      packet_id,
      temperature,
      humidity,
      soil_moisture,
      wind_speed,
      gust_speed,
      rssi0,
      rssi1,
      snr0,
      snr1,
      device_id
    ];
    await pool.query(query, values);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to insert to database' });
  }
});

app.get('/api/database/select-latest', async (req: Request, res: Response) => {
  const { requestedTable, selectColumn, conditionColumn, value } = req.query;
  let tableName = typeof requestedTable === 'string' ? requestedTable : '';
  let selectColumnName = typeof selectColumn === 'string' ? selectColumn : '';
  let conditionColumnName = typeof conditionColumn === 'string' ? conditionColumn : '';

  if (!tableNameWhiteList.has(tableName) || !valueNameWhiteList.has(selectColumnName)
    || !valueNameWhiteList.has(conditionColumnName)) {
    res.status(400).json({ error: 'table or column(s) requested not allowed' });
    return;
  }
  try {
    const latest_data = await pool.query(
      `SELECT ${selectColumnName} FROM ${tableName} WHERE ${conditionColumnName} = $1 ORDER BY ts DESC LIMIT 1;`,
      [value]
    )
    res.status(200).json(latest_data.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to select from database' });
  }
});

app.get('/api/database/select-node-range', async (req: Request, res: Response) => {
  const { requestedTable, start, end, node } = req.query;

  let tableName = typeof requestedTable === 'string' ? requestedTable : '';
  let startTime = typeof start === 'string' ? Number(start) : 0;
  let endTime = typeof end === 'string' ? Number(end) : 0;
  let nodeName = typeof node === 'string' ? Number(node) : 0;

  if (!tableNameWhiteList.has(tableName) || !nodeNameWhiteList.has(nodeName)) {
    res.status(400).json({ error: 'table or node requested not allowed' });
    return;
  }

  try {
    const all_data = await pool.query(
      `SELECT * FROM ${requestedTable} WHERE node_name = $1 AND ts BETWEEN $2 AND $3 ORDER BY ts ASC;`,
      [nodeName, startTime, endTime]
    )
    res.status(200).json(all_data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to select from database' });
  }
});

app.post('/api/database/insert-weather-data', async (req: Request, res: Response): Promise<void> => {
  try {
    const { farm_id } = req.body
    const farmId = typeof farm_id === 'string' ? farm_id : '';
    if (!farmId) {
      res.status(400).json({ error: 'farm_id query parameter is required' });
    }
    let data;
    if (req.body.time) {
      data = await getHistoricFarmWeather(farmId, req.body.time);
    } else {
      data = await getLatestFarmWeather(farmId);
    }

    const insertString =
      `INSERT INTO farm_weather_current (
    farm_id, ts, sunrise, sunset,
    temp, feels_like, pressure, humidity, dew_point, uvi, clouds, visibility,
    wind_speed, wind_deg, wind_gust, rain_1h, snow_1h, weather_id
    )
    VALUES (
      (SELECT farm_id FROM node_deployment ORDER BY ts DESC LIMIT 1),
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
      $15, $16, $17
    )
    ON CONFLICT (farm_id, ts) DO NOTHING;`;

    const values = [
      data.dt ?? null,
      data.sunrise ?? null,
      data.sunset ?? null,
      data.temp ?? null,
      data.feels_like ?? null,
      data.pressure ?? null,
      data.humidity ?? null,
      data.dew_point ?? null,
      data.uvi ?? null,
      data.clouds ?? null,
      data.visibility ?? null,
      data.wind_speed ?? null,
      data.wind_deg ?? null,
      data.wind_gust ?? null,
      data.rain?.['1h'] ?? null,
      data.snow?.['1h'] ?? null,
      data.weather?.[0]?.id ?? null,
    ];
    await pool.query(insertString, values);
    res.status(200).json({ message: 'Weather data inserted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is live on ${port}`);
});

async function getLatestFarmLocation(farmId: string) {
  if (!farmId) {
    throw new Error('No farmId given');
  }

  const { rows } = await pool.query(
    'SELECT latitude, longitude FROM farms WHERE id = $1::int LIMIT 1;',
    [farmId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function getLatestFarmWeather(farmId: string) {

  const location = await getLatestFarmLocation(farmId);
  if (!location) {
    throw new Error('Farm not found');
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${location.latitude}&lon=${location.longitude}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${process.env.WEATHER_KEY}`;
  const openWeatherRes = await fetch(url);
  if (!openWeatherRes.ok) {
    console.log("openWeather API says no:", openWeatherRes.text())
    throw new Error('Weather API request failed');
  }
  const weatherData = await openWeatherRes.json();
  let data;
  try {
    data = weatherData.current;
  } catch (error) {
    console.log("Unexpected API response format")
    throw new Error('Unexpected API response format');
  }
  return data;
}

async function getHistoricFarmWeather(farmId: string, time: string) {

  const location = await getLatestFarmLocation(farmId);
  if (!location) {
    throw new Error('Farm not found');
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${location.latitude}&lon=${location.longitude}&dt=${time}&units=metric&appid=${process.env.WEATHER_KEY}`;

  const openWeatherRes = await fetch(url);
  if (!openWeatherRes.ok) {
    console.log("openWeather API says no:", await openWeatherRes.text())
    throw new Error('Weather API request failed');
  }
  const weatherData = await openWeatherRes.json();
  let data;
  try {
    data = weatherData.data[0];
  } catch (error) {
    console.log("Unexpected API response format")
    throw new Error('Unexpected API response format');
  }
  return data;
}

async function getAndSendWeather(): Promise<void> {
  console.log('Running a task every 10 minutes!');
  const FARM_ID = '1';
  const secretWord = process.env.SECRET_WORD;
  try {
    const response = await fetch('https://agriscanner.onrender.com/api/database/insert-weather-data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretWord}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        farm_id: FARM_ID,
      }),
    });
    if (response.ok) {
      console.log('Task complete');
    } else {
      console.error(`Error: ` + await response.text());
    }
  } catch (error) {
    console.error(`Unknown error`);
  }
};

async function getLatestForecast(): Promise<void> {
  console.log('Running a task every 10 minutes!');
  const FARM_ID = '1';
  const location = await getLatestFarmLocation(FARM_ID);
  if (!location) {
    throw new Error('Farm not found');
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${location.latitude}&lon=${location.longitude}&exclude=current,minutely,daily,alerts&units=metric&appid=${process.env.WEATHER_KEY}`;

  const openWeatherRes = await fetch(url);
  if (!openWeatherRes.ok) {
    console.log("openWeather API says no:", await openWeatherRes.text())
    throw new Error('Weather API request failed');
  }
  const weatherData = await openWeatherRes.json();
  let data;
  try {
    data = weatherData.hourly;
  } catch (error) {
    console.log("Unexpected API response format")
    throw new Error('Unexpected API response format');
  }

  if (data) {
    try {
      await fs.writeFile('src/LatestForeCast.json', JSON.stringify(data));
      console.log("File written successfully");
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("No API data found")
  }

};

cron.schedule('*/10 * * * *', () => {
  getAndSendWeather();
  getLatestForecast();
});