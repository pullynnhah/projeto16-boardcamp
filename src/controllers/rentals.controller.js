import { StatusCodes } from "http-status-codes";

import db from "../database/db.connection.js";
import queryGenerator from "../utils/query.js";

const readRentals = async (req, res) => {
  const { customerId, gameId, status, startDate, limit, offset, order, desc } = req.query;
  const isOrderValid = [
    "id",
    "customerId",
    "gameId",
    "rentDate",
    "daysRented",
    "returnDate",
    "originalPrice",
    "delayFee"
  ].find(item => item === order);
  const queryValues = { limit, offset, order: isOrderValid ? order : null, desc };
  let queryString = `
  SELECT r.*, 
        json_build_object('id', c.id, 'name', c.name) AS customer,
        json_build_object('id', g.id, 'name', g.name) AS game
  FROM rentals r
  JOIN customers c ON c.id = r."customerId"
  JOIN games g ON g.id = r."gameId"
  `;

  const filters = [];
  const conditionals = [];
  if (customerId) {
    filters.push(customerId);
    conditionals.push(`"customerId" = $${filters.length}`);
  }

  if (gameId) {
    filters.push(gameId);
    conditionals.push(`"gameId" = $${filters.length}`);
  }

  if (status === "open") {
    conditionals.push(`"returnDate" IS NULL`);
  } else if (status === "closed") {
    conditionals.push(`r."returnDate" IS NOT NULL`);
  }

  if (startDate) {
    filters.push(startDate);
    conditionals.push(`"rentDate" >= $${filters.length}`);
  }

  const conditionString = conditionals.join(" AND ");
  queryString += conditionString ? "WHERE " + conditionString : "";
  const { query, params } = queryGenerator(queryString, filters, queryValues);
  try {
    const { rows: rentals } = await db.query(query, params);
    res.send(rentals);
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
      FROM rentals
      WHERE "gameId" = $9 
      AND "returnDate" ISNULL

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
