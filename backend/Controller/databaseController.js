const pg = require("pg");

// Local PG admin Client
const pool = new pg.Pool({
  host: "localhost",
  user: "khurlee",
  port: 5432,
  password: "graphipedia",
  database: "graphipedia"
});


//Cockroach DB Client
// const client = new pg.Client({
//   host: "yellow-shadow-8255.7tc.cockroachlabs.cloud",
//   user: "abuelleil",
//   port: 26257,
//   password: "lvBuhbfeW5RhYKXKmxnwkQ",
//   database: "postgres",
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

exports.createTableQuery = async (req, res) => {
  const client = await pool.connect();
  try {
    // client.connect();
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Users (
                                         id SERIAL PRIMARY KEY,
                                         name VARCHAR(255),
        age INT
        );
    `;

    await client.query(createTableQuery);
    console.log("Table created successfully");
    return res.send({ data: "Table created successfully" });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.insertIntoTable = async (req, res) => {
  const client = await pool.connect();
  try {
    // client.connect();
    const insertDataQuery = `INSERT INTO public.users (name, age) VALUES (${req.body.name},${req.body.age})`;
    await client.query(insertDataQuery);
    console.log("Rows Inserted successfully");
    const selectDataQuery = "SELECT * FROM Users";
    const result = await client.query(selectDataQuery);
    console.log("Query result:", result.rows);
    return res.send({ data: result.rows });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.insertIntoBfs = async (req, res) => {
  const client = await pool.connect();
  try {
    // client.connect();
    const insertDataQuery = `SELECT * FROM bfsQueryWithRelations(${req.body.text }::text, ${req.body.depth }::integer, ${req.body.threshold }::integer)`;
    const result = await client.query(insertDataQuery);
    console.log("Query result:", result.rows);
    return res.send({ data: result.rows });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.getAllRows = async (req, res) => {
  const client = await pool.connect();

  try {
    // client.connect();
    const selectDataQuery = `SELECT ${req.body.select} FROM ${req.body.from} ORDER BY page_id ASC LIMIT 10 `;
    const result = await client.query(selectDataQuery);
    console.log("Query result:", result.rows);
    return res.send({ data: result.rows });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.QueryResultTable = async (req, res) => {
  const client = await pool.connect();

  try {
    // client.connect();
    const Query = `DROP TABLE IF EXISTS QueryResult CASCADE;
    CREATE TABLE QueryResult (
                               from_title      varchar(255),
                               from_id         integer,
                               to_title        text[],
                               to_id           integer[]
    );`;
    await client.query(Query);
    console.log("Table created successfully");
    return res.send({ data: "Query Result Table creation Complete" });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.bfsQuery = async (req, res) => {
  const client = await pool.connect();

  try {
    // client.connect();
    const Query = `CREATE OR REPLACE FUNCTION bfsQuery(articleNames text, maxDepth integer) RETURNS SETOF QueryResult AS $$
    WITH RECURSIVE RecursivePageCTE AS (
        SELECT
            p.page_id AS from_id,
            CAST(unnest(pl.page_children) AS integer) AS to_id,
            1 AS depth
        FROM
            public.pagelinks pl
        JOIN
            public.pages p ON pl.page_id = p.page_id
        WHERE
            p.page_title IN (SELECT unnest(string_to_array(articleNames, ',')))
        UNION ALL
        SELECT
            t.page_id AS from_id,
            CAST(unnest(t.page_children) AS integer) AS to_id,
            r.depth + 1
        FROM
            public.pagelinks t
        JOIN
            RecursivePageCTE r ON r.to_id = t.page_id
        WHERE
            r.depth < maxDepth
    )
    SELECT inside.from_title AS from_title, inside.from_id AS from_id, array_agg(inside.to_title) AS children_title, array_agg(inside.to_id) AS children_id
    FROM (SELECT p.page_title AS from_title, idpairs.from_id AS from_id, p2.page_title AS to_title, idpairs.to_id AS to_id
        FROM
            (select from_id, to_id from RecursivePageCTE) idpairs
        JOIN
            public.pages p ON p.page_id = idpairs.from_id
        JOIN
            public.pages p2 ON p2.page_id = idpairs.to_id) inside
    GROUP BY inside.from_title, inside.from_id
    $$ LANGUAGE sql;`;

    const result = await client.query(Query);
    console.log("Query result:", result.rows);
    return res.send({ data: "bfsQuery Complete" });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.getRow = async (req, res) => {
  const client = await pool.connect();
  try {
    // client.connect();
    const result = await client.query(
        `select ${req.body.select} from ${req.body.from} where ${req.body.where}`
    );
    console.log("Query result:", result.rows);
    return res.json({ data: result.rows });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.DeleteRowFromUsers = async (req, res) => {
  const client = await pool.connect();

  try {
    // client.connect();
    const Query = `Delete FROM ${req.body.from}  where ${req.body.where}`;
    await client.query(Query);
    const selectDataQuery = "SELECT * FROM Users";
    const result = await client.query(selectDataQuery);
    console.log("Remaining Data:", result.rows);
    // return res.send({ data: result.rows });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};

exports.DropTable = async (req, res) => {
  const client = await pool.connect();
  try {
    const Query = `DROP TABLE ${req.body.select} `;
    const result = await client.query(Query);
    console.log("Query result:", result.rows);
    // return res.send({ data: result.rows });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    console.log("Connection closed");
  }
};


// create the functions in database
// DROP TABLE IF EXISTS QueryResult CASCADE;
// CREATE TABLE QueryResult (
//     from_title      varchar(255),
//     from_id         integer,
//     to_title        text[],
//     to_id           integer[]
// );
// CREATE OR REPLACE FUNCTION bfsQuery(articleNames text, maxDepth integer) RETURNS SETOF QueryResult AS $$
// WITH RECURSIVE RecursivePageCTE AS (
//     SELECT
// p.page_id AS from_id,
//     CAST(unnest(pl.page_children) AS integer) AS to_id,
//     1 AS depth
// FROM
// public.pagelinks pl
// JOIN
// public.pages p ON pl.page_id = p.page_id
// WHERE
// p.page_title IN (SELECT unnest(string_to_array(articleNames, ',')))
// UNION ALL
// SELECT
// t.page_id AS from_id,
//     CAST(unnest(t.page_children) AS integer) AS to_id,
// r.depth + 1
// FROM
// public.pagelinks t
// JOIN
// RecursivePageCTE r ON r.to_id = t.page_id
// WHERE
// r.depth < maxDepth
// )
// SELECT inside.from_title AS from_title, inside.from_id AS from_id, array_agg(inside.to_title) AS children_title, array_agg(inside.to_id) AS children_id
// FROM (SELECT p.page_title AS from_title, idpairs.from_id AS from_id, p2.page_title AS to_title, idpairs.to_id AS to_id
// FROM
// (select from_id, to_id from RecursivePageCTE) idpairs
// JOIN
// public.pages p ON p.page_id = idpairs.from_id
// JOIN
// public.pages p2 ON p2.page_id = idpairs.to_id) inside
// GROUP BY inside.from_title, inside.from_id
// $$ LANGUAGE sql;

// GRANT SELECT, INSERT, UPDATE, DELETE ON pages TO khurlee;
// GRANT SELECT, INSERT, UPDATE, DELETE ON pagelinks TO khurlee;
