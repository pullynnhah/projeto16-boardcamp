import joi from "joi";

const schema = joi.object({
  name: joi.string().required(),
  image: joi.string().required(),
  stockTotal: joi.number().integer().positive().required(),
  pricePerDay: joi.number().integer().positive().required()
});

export default schema;
