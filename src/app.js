import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";

import gamesRouter from "./routes/games.router.js";
import customersRouter from "./routes/customers.router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(json());

app.use(gamesRouter);
app.use(customersRouter);

app.listen(PORT, () => console.log(`💫 Magic happens @ http://localhost:${PORT}`));
