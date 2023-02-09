import { StatusCodes } from "http-status-codes";
import schema from "../schemas/customers.schema.js";

// FIXME: this code is almost identical to games.middleware.js (schema
// value its all that changes) how do I join them so I have less code.
const validate = (req, res, next) => {
  const validation = schema.validate(req.body);
  if (validation.error) res.sendStatus(StatusCodes.BAD_REQUEST);
  else next();
};

export default validate;
