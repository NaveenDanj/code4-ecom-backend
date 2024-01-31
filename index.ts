import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import api from './src/routes/api'
import mongoose from "mongoose";
import path from 'path'

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));
app.use("/images", express.static(path.join(__dirname, 'uploads')));


mongoose
  .connect(process.env.MONGODB_CONNECTION_URL+'')
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch(() => {
    console.log("error connecting to mongodb ");
  });

app.use('/api/v1' , api)

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});