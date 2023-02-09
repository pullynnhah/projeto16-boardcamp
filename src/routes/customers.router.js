import { Router } from "express";

import * as customersControllers from "../controllers/customers.controller.js";
import schema from "../schemas/customers.schema.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/customers", customersControllers.readCustomers);
router.get("/customers/:id", customersControllers.findCustomer);

router.post("/customers", validate(schema), customersControllers.createCustomer);
router.put("/customers/:id", validate(schema), customersControllers.updateCustomer);

export default router;
