import joi from "joi";

const schema = joi.object({
  name: joi.string().required(),
  cpf: joi
    .string()
    .pattern(/^[0-9]{11}$/)
    .required(),
  phone: joi
    .string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  birthday: joi.date().required()
});

export default schema;
