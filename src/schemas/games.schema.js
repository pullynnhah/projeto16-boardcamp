import joi from "joi";

const schema = joi.object({
  name: joi.string().required(),
  image: joi.string().required(),
  stockTotal: joi.number().integer().min(0).required(),
  pricePerDay: joi.number().integer().min(0).required()
});

export default schema;
