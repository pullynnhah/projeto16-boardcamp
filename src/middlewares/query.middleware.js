const query = columns => (req, res, next) => {
  const { limit, offset, order, desc } = req.query;
  let query = "";
  const params = [];

  if (columns.length === 1) {
    const filter = req.query[columns[0]];
    if (filter) {
      params.push(`${filter}%`);
      query += ` WHERE LOWER("${columns[0]}") LIKE LOWER($${params.length})`;
    }
  } else {
    const filter1 = req.query[columns[0]];
    const filter2 = req.query[columns[1]];
    params.push(`${filter1}%`, `${filter2}%`);
    query += `
    WHERE LOWER("${columns[0]}") LIKE LOWER($${params.length - 1}) 
    AND LOWER("${columns[1]}") LIKE LOWER($${params.length})`;
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
