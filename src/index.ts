import express from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv'
import { pool } from './db'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

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
      'SELECT * FROM ${requestedTable} WHERE node_name = $1 AND ts BETWEEN $2 AND $3 ORDER BY ts ASC;`',
      [nodeName, startTime, endTime]
    )
    res.status(200).json(all_data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to select from database' });
  }
});

// // async function getCurrentWeather() {
// //   const url = "https://api.openweathermap.org/data/3.0/onecall?lat=51.5381&lon=-2.3938&exclude=minutely,hourly,daily,alerts&units=metric&appid=" + process.env.WEATHER_KEY;
// //   const resp = await fetch(url);
// //   if (!resp.ok) {
// //     const error = await resp.text();
// //     throw new Error(error);
// //   }
// //   const weather_data = await resp.json();

// //   const latitude
// //   const longitude
// //   const temperature = 
// //   const humidity =
// //   const wind_speed = 
// //   const gust_speed =
// //   const precipitation =
// //   const 
// // }

app.listen(port, () => {
  console.log(`Server is live on ${port}`);
});