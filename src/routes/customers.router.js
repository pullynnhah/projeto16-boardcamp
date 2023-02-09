import { Router } from "express";

import * as customersControllers from "../controllers/customers.controller.js";
import schema from "../schemas/customers.schema.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/customers", customersControllers.readCustomers);
router.get("/customers/:id", customersControllers.findCustomer);

router.use(validate(schema));
router.post("/customers", customersControllers.createCustomer);
router.put("/customers/:id", customersControllers.updateCustomer);

export default router;
