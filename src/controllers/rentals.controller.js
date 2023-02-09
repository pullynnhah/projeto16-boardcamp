import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";

const readRentals = async (req, res) => {
  const { customerId, gameId } = req.query;

  try {
    if (customerId && gameId) {
      const { rows: rentals } = await db.query(
        `
      SELECT r.*, 
            json_build_object('id', c.id, 'name', c.name) AS customer,
            json_build_object('id', g.id, 'name', g.name) AS game
      FROM rentals r
      JOIN customers c ON c.id = r."customerId"
      JOIN games g ON g.id = r."gameId"
      WHERE customerId = $1 AND gameId = $2;
      `,
        [customerId, gameId]
      );
      res.send(rentals);
    } else if (customerId && gameId) {
      const { rows: rentals } = await db.query(
        `
      SELECT r.*, 
            json_build_object('id', c.id, 'name', c.name) AS customer,
            json_build_object('id', g.id, 'name', g.name) AS game
      FROM rentals r
      JOIN customers c ON c.id = r."customerId"
      JOIN games g ON g.id = r."gameId"
      WHERE customerId = $1;
      `,
        [customerId]
      );
      res.send(rentals);
    } else if (customerId && gameId) {
      const { rows: rentals } = await db.query(
        `
      SELECT r.*, 
            json_build_object('id', c.id, 'name', c.name) AS customer,
            json_build_object('id', g.id, 'name', g.name) AS game
      FROM rentals r
      JOIN customers c ON c.id = r."customerId"
      JOIN games g ON g.id = r."gameId"
      WHERE gameId = $1;
      `,
        [gameId]
      );
      res.send(rentals);
    } else {
      const { rows: rentals } = await db.query(
        `
      SELECT r.*, 
            json_build_object('id', c.id, 'name', c.name) AS customer,
            json_build_object('id', g.id, 'name', g.name) AS game
      FROM rentals r
      JOIN customers c ON c.id = r."customerId"
      JOIN games g ON g.id = r."gameId";
    `
      );
      res.send(rentals);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const createRental = async (req, res) => {
  const { customerId, gameId, daysRented } = req.body;

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
        new Date(),
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

const returnRental = async (req, res) => {
  const { id } = req.params;
  const date = new Date();

  try {
    const { rows } = await db.query("SELECT * FROM rentals WHERE id = $1", [id]);
    if (!rows[0]) res.sendStatus(StatusCodes.NOT_FOUND);
    else {
      const { rowCount } = await db.query(
        `
      UPDATE rentals
      SET "returnDate" = $1,
      "delayFee" = (
        SELECT "pricePerDay"
        FROM games
        WHERE id = rentals."gameId"
      ) * GREATEST(0, DATE_PART('day', $2::timestamp - "rentDate"::timestamp) - "daysRented")
      WHERE id = $3
      AND "returnDate" ISNULL;
      `,
        [date, date, id]
      );
      if (rowCount === 1) res.sendStatus(StatusCodes.OK);
      else res.sendStatus(StatusCodes.BAD_REQUEST);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

const deleteRental = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query("SELECT * FROM rentals WHERE id = $1", [id]);
    if (!rows[0]) res.sendStatus(StatusCodes.NOT_FOUND);
    else {
      const { rowCount } = await db.query(
        `
      DELETE FROM rentals
      WHERE id = $1
      AND "returnDate" IS NOT NULL;
      `,
        [id]
      );
      if (rowCount === 1) res.sendStatus(StatusCodes.OK);
      else res.sendStatus(StatusCodes.BAD_REQUEST);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
};

export { readRentals, createRental, returnRental, deleteRental };
