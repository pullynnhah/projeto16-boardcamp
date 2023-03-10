import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";
import queryGenerator from "../utils/query.js";

const readCustomers = async (req, res) => {
  const { cpf, limit, offset, order, desc } = req.query;
  const isOrderValid = ["id", "name", "phone", "cpf", "birthday"].find(item => item === order);
  const queryValues = { limit, offset, order: isOrderValid ? order : null, desc };

  let queryString = "SELECT * FROM customers";
  const filters = [];
  if (cpf) {
    filters.push(`${cpf}%`);
    queryString += ` WHERE cpf LIKE $1`;
  }
  const { query, params } = queryGenerator(queryString, filters, queryValues);

  try {
    const { rows: customers } = await db.query(query, params);
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
    WHERE NOT EXISTS (SELECT * FROM customers WHERE cpf = $5);
    `,
      [name, phone, cpf, birthday, cpf]
    );
    if (rowCount === 1) res.sendStatus(StatusCodes.CREATED);
    else res.sendStatus(StatusCodes.CONFLICT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const updateCustomer = async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;
  const { id } = req.params;

  try {
    const { rowCount } = await db.query(
      `
    UPDATE customers
    SET name = $1,
        phone = $2,
        cpf = $3,
        birthday = $4

    WHERE id = $5 
    AND NOT EXISTS (SELECT * FROM customers WHERE cpf = $6 AND id <> $7);
    `,
      [name, phone, cpf, birthday, id, cpf, id]
    );
    if (rowCount === 1) res.sendStatus(StatusCodes.OK);
    else res.sendStatus(StatusCodes.CONFLICT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const findCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: customer } = await db.query(
      `
    SELECT * FROM customers
    WHERE id = $1`,
      [id]
    );
    if (customer[0]) res.send(customer[0]);
    else res.sendStatus(StatusCodes.NOT_FOUND);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

export { readCustomers, createCustomer, findCustomer, updateCustomer };
