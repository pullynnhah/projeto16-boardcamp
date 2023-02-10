import { StatusCodes } from "http-status-codes";

const query = column => (req, res, next) => {
  const { limit, offset, order, desc } = req.query;
  const filter = req.query[column];
  const params = [];

  let query = "";
  if (filter) {
    params.push(`${filter}%`);
    query += ` WHERE LOWER("${column}") LIKE LOWER($${params.length})`;
  }

  if (order) {
    query += ` ORDER BY "${order}"`;
  }

  query += desc ? " DESC" : "";

  if (limit) {
    params.push(Number(limit));
    query += ` LIMIT $${params.length}`;
  }

  if (offset) {
    params.push(Number(offset));
    query += ` OFFSET $${params.length}`;
  }

  res.locals.queryString = query;
  res.locals.params = params;
  next();
};

export default query;
