-- Create table relations
DROP TABLE IF EXISTS relations CASCADE;
CREATE TABLE relations (
    page_id         integer primary key,
    page_title      varchar(255),
    reference_count integer,
    children_count  integer,
    refs            integer[],
    children        integer[]
);

-- Fill relations table
INSERT INTO relations
SELECT
    sub.page_id, sub.page_title, sub.reference_count, sub.children_count, sub.referenced_page_id, CAST(pl.page_children AS integer[]) AS children
FROM
    (SELECT
        p.page_id, p.page_title, COUNT(p.page_id) AS reference_count, p.children_count, array_agg(allReferences.parent_id) AS referenced_page_id
    FROM
        (SELECT
            CAST(unnest(pl.page_children) AS integer) AS children_id, pl.page_id AS parent_id
         FROM
            pagelinks pl
         WHERE
             array_length(pl.page_children, 1) >= 50) allReferences
    JOIN
        pages p ON allReferences.children_id = p.page_id
    GROUP BY
        p.page_id) sub
JOIN
    pagelinks pl ON pl.page_id = sub.page_id;

DROP TABLE IF EXISTS query_result_2 CASCADE;
CREATE TABLE query_result_2 (
    from_title      varchar(255),
    from_id         integer,
    to_title        text[],
    to_id           integer[],
    reference_count integer[]
);

CREATE OR REPLACE FUNCTION bfsQueryWithRelations(articleNames text, maxDepth integer) RETURNS SETOF query_result_2 AS $$
    WITH RECURSIVE RecursivePageCTE AS (
        SELECT
            re.page_id AS from_id,
            unnest(re.children) AS to_id,
            1 AS depth
        FROM
            public.relations re
        WHERE
            re.page_title IN (SELECT unnest(string_to_array(articleNames, ',')))
        UNION ALL
        SELECT
            re.page_id AS from_id,
            unnest(re.children) AS to_id,
            r.depth + 1
        FROM
            public.relations re
        JOIN
            RecursivePageCTE r ON r.to_id = re.page_id
        WHERE
            r.depth < maxDepth
    )

    SELECT inside.from_title AS from_title, inside.from_id AS from_id, array_agg(inside.to_title) AS children_title, array_agg(inside.to_id) AS children_id, array_agg(inside.reference_count)
    FROM (SELECT re.page_title AS from_title, idpairs.from_id AS from_id, re2.page_title AS to_title, idpairs.to_id AS to_id, re2.reference_count
        FROM
            (select from_id, to_id from RecursivePageCTE) idpairs
        JOIN
            public.relations re ON re.page_id = idpairs.from_id
        JOIN
            public.relations re2 ON re2.page_id = idpairs.to_id) inside
    GROUP BY inside.from_title, inside.from_id

$$ LANGUAGE sql;