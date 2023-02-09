import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";

const readCustomers = async (req, res) => {
  try {
    const { rows: customers } = await db.query("SELECT * FROM customers;");
    res.send(customers);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const createCustomer = async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const { rowCount } = await db.query(
      `
    INSERT INTO customers 
    (name, phone, cpf, birthday)
    SELECT $1, $2, $3, $4
    WHERE (SELECT COUNT(*) FROM customers WHERE cpf = $5) = 0;
    `,
      [name, phone, cpf, birthday, cpf]
    );
    if (rowCount === 1) res.sendStatus(StatusCodes.CREATED);
    else res.sendStatus(409);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

export { readCustomers, createCustomer };
