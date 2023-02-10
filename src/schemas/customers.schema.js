import joi from "joi";

const schema = joi.object({
  name: joi.string().required(),
  cpf: joi
    .string()
    .pattern(/^\d{11}$/)
    .required(),
  phone: joi
    .string()
    .pattern(/^\d{10,11}$/)
    .required(),
  birthday: joi.date().required()
});

export default schema;
