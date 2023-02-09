import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";

const readGames = async (req, res) => {
  try {
    const { rows: games } = await db.query("SELECT * FROM games;");
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
    WHERE (SELECT COUNT(*) FROM games WHERE name = $5) = 0;
    `,
      [name, image, stockTotal, pricePerDay, name]
    );
    if (rowCount === 1) return res.sendStatus(StatusCodes.CREATED);
    res.sendStatus(409);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

export { readGames, createGame };
