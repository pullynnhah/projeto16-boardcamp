const queryGenerator = (query, params, queryValues) => {
  const { limit, offset, order, desc } = queryValues;

  if (order) {
    query += ` ORDER BY "${order}"`;
  }

  query += desc ? " DESC" : "";

  if (limit) {
    params.push(Number(limit));
    query += ` LIMIT $${params.length + colCount}`;
  }

  if (offset) {
    params.push(Number(offset));
    query += ` OFFSET $${params.length + colCount}`;
  }

  return { query, params };
};

export default queryGenerator;
