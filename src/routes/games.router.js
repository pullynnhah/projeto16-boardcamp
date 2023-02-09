import { Router } from "express";

import gamesMiddleware from "../middlewares/games.middleware.js";
import * as gamesControllers from "../controllers/games.controller.js";

const router = Router();

router.get("/games", gamesControllers.readGames);
router.post("/games", gamesMiddleware, gamesControllers.createGame);

export default router;
