import { StatusCodes } from "http-status-codes";
import schema from "../schemas/games.schema.js";

const validate = (req, res, next) => {
  const validation = schema.validate(req.body);
  if (validation.error) return res.sendStatus(StatusCodes.BAD_REQUEST);
  next();
};

export default validate;
