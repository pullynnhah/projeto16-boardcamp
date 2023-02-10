import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";
import queryGenerator from "../utils/query.js";

const readGames = async (req, res) => {
  const { name, limit, offset, order, desc } = req.query;
  const isOrderValid = ["id", "name", "image", "stockTotal", "pricePerDay"].find(
    item => item === order
  );
  const queryValues = { limit, offset, order: isOrderValid ? order : null, desc };

  const filters = [];
  let queryString = "SELECT * FROM games";
  if (name) {
    filters.push(`${name}%`);
    queryString += ` WHERE LOWER(name) LIKE LOWER($1)`;
  }
  const { query, params } = queryGenerator(queryString, filters, queryValues);

  try {
    const { rows: games } = await db.query(query, params);
    res.send(games);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const createGame = async (req, res) => {
  const { name, image, stockTotal, pricePerDay } = req.body;

  try {
    const { rowCount } = await db.query(
      `
    INSERT INTO games 
    (name, image, "stockTotal", "pricePerDay")
    SELECT $1, $2, $3, $4
    WHERE NOT EXISTS (SELECT * FROM games WHERE name = $5);
    `,
      [name, image, stockTotal, pricePerDay, name]
    );
    if (rowCount === 1) res.sendStatus(StatusCodes.CREATED);
    else res.sendStatus(StatusCodes.CONFLICT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

export { readGames, createGame };
