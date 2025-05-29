//Express, Request, Response are types from the express module
import express, { Express, Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Writing out the types for request and response just for clarity
// In reality, typescriopt can infer these types automatically
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!!!!');
});

app.get('/subdirectory', (req: Request, res: Response) => {
  res.send('Oh look a subdirectory!!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});