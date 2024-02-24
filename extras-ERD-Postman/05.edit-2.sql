-- redundant as cart will be stored locally on FE only
drop table cart;

-- check contraints of purchase
SELECT con.*
       FROM pg_catalog.pg_constraint con
            INNER JOIN pg_catalog.pg_class rel
                       ON rel.oid = con.conrelid
            INNER JOIN pg_catalog.pg_namespace nsp
                       ON nsp.oid = connamespace
-- 	WHERE nsp.nspname = '<schema name>'
       WHERE nsp.nspname = 'public' AND rel.relname = 'purchase';

-- recreate table purchase;
drop table purchase;

CREATE TABLE IF NOT EXISTS purchase(
		id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		user_id integer REFERENCES db_user(id),
		total numeric(5, 2),
		placed_on TIMESTAMP DEFAULT NULL,	-- js will timestamp both, former upon POST, latter upon UPDATE
		fulfilled_on TIMESTAMP DEFAULT NULL
	);
	
CREATE TABLE IF NOT EXISTS album_purchase(
  album_id INTEGER REFERENCES album(id),
  purchase_id INTEGER REFERENCES purchase(id),
  PRIMARY KEY(album_id, purchase_id)
);

select * from db_user;
select * from purchase;

INSERT into purchase(user_id, total, placed_on)
values (1, 100, NOW());

ALTER USER postgres WITH PASSWORD 'postgres';