const query = (req, res, next) => {
  const { customerId, gameId, cpf, name, limit, offset, order, desc } = req.query;

  let colCount = [customerId, gameId, cpf, name].filter(param => param).length;
  let query = "";
  const params = [];

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

  res.locals.queryString = query + ";";
  res.locals.params = params;
  next();
};

export default query;
