import { StatusCodes } from "http-status-codes";
import schema from "../schemas/games.schema.js";

const validate = (req, res, next) => {
  const validation = schema.validate(req.body);
  if (validation.error) res.sendStatus(StatusCodes.BAD_REQUEST);
  else next();
};

export default validate;
