import express from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv'
import { pool } from './db'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/chipping-sodbury', async (req: Request, res: Response) => {
  const {
    timestamp,
    device_id,
    packet_id,
    temperature,
    humidity,
    soil_moisture,
    wind_speed,
    rssi0,
    rssi1,
    snr0,
    snr1,
  } = req.body;

  try {
    const query = `INSERT INTO chipping_sodbury 
      (timestamp, device_id, packet_id, temperature, humidity, soil_moisture, 
      wind_speed, rssi0, rssi1, snr0, snr1)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);`;
    const values = [
      timestamp,
      device_id,
      packet_id,
      temperature,
      humidity,
      soil_moisture,
      wind_speed,
      rssi0,
      rssi1,
      snr0,
      snr1,
    ];
    await pool.query(query, values);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to insert to database' });
  }
});

app.get('/api/chipping-sodbury', async (req: Request, res: Response) => {
  const { column, device_id } = req.query;
  try {
    const latest_data = await pool.query(
      `SELECT ${column} FROM chipping_sodbury WHERE device_id = ${device_id} ORDER BY timestamp DESC LIMIT 1;`,
    )
    res.status(200).json(latest_data.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to select from database' });
  }
});

app.listen(port, () => {
  console.log(`Server is live on ${port}`);
});