const queryGenerator = (query, params, queryValues) => {
  const { limit, offset, order, desc } = queryValues;

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

  return { query, params };
};

export default queryGenerator;
