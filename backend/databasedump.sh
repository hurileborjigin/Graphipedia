psql -U postgres -d postgres -f Working_Database.sql
so for instance:
psql -U postgres -d postgres -f Working_Database.sql
psql -U postgres -d postgres -c "\COPY pages FROM 'enwiki-latest-page_FINAL.csv';"
psql -U postgres -d postgres -c "\COPY pagelinks FROM 'enwiki-latest-pagelinks_FINAL.csv';"