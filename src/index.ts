import express from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv'
import { pool } from './db'

const app = express();
const port = process.env.PORT;

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
    await pool.query(
      `INSERT INTO chipping_sodbury 
      (timestamp, device_id, packet_id, temperature, humidity, soil_moisture, 
      wind_speed, rssi0, rssi1, snr0, snr1)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
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
      ]
    );
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to insert to database' });
  }
});

app.get('/api/chipping-sodbury', async (req: Request, res: Response) => {
  try {
    await pool.query(
      `SELECT * FROM chipping_sodbury ORDER BY timestamp DESC LIMIT 1;`
    )
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to select from database' });
  }
});

app.listen(port, () => {
});