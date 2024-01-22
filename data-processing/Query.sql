-- INITIALIZATION

-- Table that need to be created for the bfsQuery to return (this is the return format)
DROP TABLE IF EXISTS QueryResult CASCADE;
CREATE TABLE QueryResult (
    from_title      varchar(255),
    from_id         integer,
    to_title        text[],
    to_id           integer[]
);

-- Input:
--   articleNames: String containing the title names the user wants to query (comma separated)
--   maxDepth: maximum BFS depth of the query (min 1)
-- Output: Table of format QueryResult containing edges in the format from_title (origin of the edge)
-- and children (end of the edges)
CREATE OR REPLACE FUNCTION bfsQuery(articleNames text, maxDepth integer) RETURNS SETOF QueryResult AS $$
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

$$ LANGUAGE sql;

-- ON USER QUERY
-- Example query (uncomment)
--SELECT * FROM bfsQuery('Aristotle', 2)
