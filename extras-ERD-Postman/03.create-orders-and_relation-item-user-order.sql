drop table if exists cart cascade;
-- link between user and album, one order might consist of many carts
-- need cart number too, not unique, related to each specific cart
CREATE TABLE IF NOT EXISTS cart(
		id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		cart_no INTEGER,
		user_id integer REFERENCES db_user(id),
		album_id integer REFERENCES album(id)
	);

INSERT into cart (cart_no, album_id, user_id) 	values (1, 1, 1);
-- he loves it, re-orderes it
INSERT into cart (cart_no, album_id, user_id) 	values (1, 1, 1);
-- and orders others
INSERT into cart (cart_no, album_id, user_id) 	values (1, 9, 1);
INSERT into cart (cart_no, album_id, user_id) 	values (1, 1, 1);

drop table if exists purchase;

CREATE TABLE IF NOT EXISTS purchase(
		id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		total numeric(5, 2),
		placed_on TIMESTAMP DEFAULT NULL,	-- js will timestamp both, former upon POST, latter upon UPDATE
		fulfilled_on TIMESTAMP DEFAULT NULL,
		cart_no INTEGER NOT NULL, -- need to get this value from cart(cart_no) and put it here as it will also relate to album-user
		user_id integer REFERENCES db_user(id),
	    UNIQUE (cart_no, user_id)
	);

-- copy cart no from cart, note this one is not unique and cannot be FK
UPDATE purchase
SET cart_no = (SELECT cart_no FROM cart WHERE user_id = cart.user_id);

-- calculte total
CREATE OR REPLACE FUNCTION  autosum_product_price()
RETURNS trigger AS
	'begin
		UPDATE purchase p
		   SET total = c.total
				FROM (SELECT cart.cart_no, SUM (album.price) AS total
					FROM album
					JOIN cart ON cart.album_id = album.id
					GROUP BY cart.cart_no
					) c 
				WHERE p.cart_no = c.cart_no;				
		
	RETURN NEW; 
	end;'
LANGUAGE plpgsql;


drop trigger if exists calculate_order_total ON purchase CASCADE;
CREATE TRIGGER calculate_order_total
  AFTER INSERT
  ON purchase
  EXECUTE PROCEDURE autosum_product_price();
  
  -- place order
INSERT into purchase ( cart_no, user_id)
VALUES (1, 1);

select *,  
	array(
		SELECT album.id 
    	from album 
    	LEFT JOIN cart 
    	on cart.album_id = album.id
		WHERE cart.user_id =6
    	) as albums_ordered
from purchase;



-- UPDATE purchase p
--     SET total = c.total
-- FROM (SELECT cart.cart_no, SUM (album.price) AS total
-- 		FROM album
-- 		JOIN cart ON cart.album_id = album.id
-- 	  	GROUP BY cart.cart_no
--      ) c 
-- WHERE p.cart_no = c.cart_no;


-- select cart.id as "Cart ID", cart.cart_no, cart.user_id, album.name, album.band_name, album.colour, album.price, album.price from cart 
-- JOIN album
-- ON album.id = cart.album_id
-- where cart.user_id = 6 and cart.cart_no = 1;



SELECT *, array(
            SELECT album.id 
            from album 
            LEFT JOIN cart 
            on cart.album_id = album.id
            LEFT JOIN purchase 
            on purchase.cart_no = cart.cart_no
            WHERE cart.user_id = 1
            AND purchase.id = 13

            ) as albums_ordered
            FROM purchase            
            WHERE purchase.user_id = 1
            AND purchase.id = 13;
			
			
