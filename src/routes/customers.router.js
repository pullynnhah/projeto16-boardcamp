import { Router } from "express";

import customersMiddleware from "../middlewares/customers.middleware.js";
import * as customersControllers from "../controllers/customers.controller.js";

const router = Router();

router.get("/customers", customersControllers.readCustomers);
router.get("/customers/:id", customersControllers.findCustomer);

router.post("/customers", customersMiddleware, customersControllers.createCustomer);
router.put("/customers/:id", customersControllers.updateCustomer);

export default router;
