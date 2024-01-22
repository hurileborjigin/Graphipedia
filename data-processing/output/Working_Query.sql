WITH RECURSIVE RecursivePageCTE AS (
  SELECT
    unnest(pl.page_children) AS child_page_id,
	p.page_id AS parent_page_id,
    p.page_title AS parent_page_title,
    1 AS depth
  FROM
    "public"."pagelinks" pl
  JOIN
    "public"."pages" p ON pl.page_id = p.page_id
  WHERE
    pl.page_title = 'Binary'--5058739 -- Replace with the desired page_id/title
  UNION ALL
  SELECT
    unnest(t.page_children) AS child_page_id,
	t.page_id AS parent_page_id,
    t.page_title AS parent_page_title,
    r.depth + 1
  FROM
    "public"."pagelinks" t
  JOIN
    RecursivePageCTE r ON r.child_page_id::int = t.page_id
  WHERE
    r.depth < 1 -- Replace 3 with the desired depth
)
SELECT
  parent_page_id,
  child_page_id,
  parent_page_title,
  cp.page_title AS child_page_title,
  depth
FROM
  RecursivePageCTE r
LEFT JOIN LATERAL (
  SELECT page_title
  FROM "public"."pages" cp
  WHERE cp.page_id = r.child_page_id::int 
) cp ON true;
