import { Router } from "express";

import * as gamesControllers from "../controllers/games.controller.js";
import schema from "../schemas/games.schema.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/games", gamesControllers.readGames);
router.post("/games", validate(schema), gamesControllers.createGame);

export default router;
