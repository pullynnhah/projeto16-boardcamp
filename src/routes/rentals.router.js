import { Router } from "express";

import * as rentalsControllers from "../controllers/rentals.controller.js";
import schema from "../schemas/rentals.schema.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/rentals", rentalsControllers.readRentals);
router.post("/rentals/:id/return", rentalsControllers.returnRental);
router.post("/rentals", validate(schema), rentalsControllers.createRental);

export default router;
