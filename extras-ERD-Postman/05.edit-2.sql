-- redundant as cart will be stored locally on FE only
drop table if exists cart;

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
drop table if exists  album_purchase;
drop table purchase;

CREATE TABLE IF NOT EXISTS purchase(
		id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		user_id integer REFERENCES db_user(id),
		total numeric(5, 2),
		placed_on TIMESTAMP DEFAULT NULL,	-- js will timestamp both, former upon POST, latter upon UPDATE
		fulfilled_on TIMESTAMP DEFAULT NULL,
		count_items integer
		);
	
CREATE TABLE IF NOT EXISTS album_purchase(
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	album_id INTEGER REFERENCES album(id),
	purchase_id INTEGER REFERENCES purchase(id)
	);

select * from db_user;
select * from purchase;
select * from album_purchase;

-- solved error with 'invalid' pass
ALTER USER postgres WITH PASSWORD 'postgres';

select *,  
	array(
		SELECT album.id 
    	from album 
    	LEFT JOIN album_purchase 
    	on album_purchase.album_id = album_purchase.id
		
    	) as albums_ordered
from purchase
WHERE purchase.user_id = 10
ORDER BY id ASC;

SELECT 	
    purchase.id as "purchase_id",
    db_user.id as "user_id",
    db_user.email as "user_email", 
    db_user.f_name as "f_name",
    db_user.l_name as "l_name",
    purchase.placed_on,
    purchase.fulfilled_on,
    purchase.total		
    , array (
        SELECT array(
            select(album.id,album.name, album.colour, album.price, album.cover, album.band_name) as album_data
        ) from album 
        LEFT JOIN album_purchase on album_purchase.purchase_id = album_purchase.id ) 
    as albums_ordered 
    from purchase 
    LEFT JOIN db_user on db_user.id = purchase.user_id 
-- 	where db_user.id = 10
ORDER BY db_user.id ASC,
purchase.placed_on DESC;
--user id, then latest orders first;

select * from purchase;
update purchase 
set fulfilled_on = now() 
where id=2;

select *  from album_purchase;

select * from album;

