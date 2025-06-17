import express from 'express';
import { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/subdirectory', (_req: Request, res: Response) => {
  res.send('Oh look a subdirectory!!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});