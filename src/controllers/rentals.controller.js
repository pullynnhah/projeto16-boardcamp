import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";

const readRentals = async (req, res) => {
  try {
    const { rows: rentals } = await db.query(`
    SELECT r.*, 
           json_build_object('id', c.id, 'name', c.name) AS customer,
           json_build_object('id', g.id, 'name', g.name) AS game
    FROM rentals r
    JOIN customers c ON c.id = r."customerId"
    JOIN games g ON g.id = r."gameId";
    `);
    res.send(rentals);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const createRental = async (req, res) => {
  const { customerId, gameId, daysRented } = req.body;

  const rentDate = new Date();

  try {
    const { rowCount } = await db.query(
      `
    INSERT INTO rentals 
    ("customerId", "gameId", "rentDate", "daysRented", "originalPrice")
    SELECT $1, $2, $3, $4, $5 * (SELECT "pricePerDay" FROM games WHERE id = $6)
    WHERE EXISTS (
      SELECT id 
      FROM customers 
      WHERE id = $7
    ) 
    AND EXISTS (
      SELECT id
      FROM games
      WHERE id = $8   
    )
    AND (
      SELECT COUNT(*)
      FROM games g
      JOIN rentals r ON r."gameId" = g.id
      WHERE g.id = $9 
      AND r."returnDate" ISNULL

    ) < (
      SELECT "stockTotal"
      FROM games
      WHERE id = $10
    );
    `,
      [
        customerId,
        gameId,
        rentDate,
        daysRented,
        daysRented,
        gameId,
        customerId,
        gameId,
        gameId,
        gameId
      ]
    );
    if (rowCount === 1) res.sendStatus(StatusCodes.CREATED);
    else res.sendStatus(StatusCodes.BAD_REQUEST);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

export { readRentals, createRental };
