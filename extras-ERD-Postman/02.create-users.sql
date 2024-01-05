-- list column names
SELECT column_name,	data_type
FROM information_schema.columns
WHERE table_name = 'album';


DROP table if exists db_user;
drop function if exists replace_empty_str_with_null;

-- address should not be unique field as we can have multiple users at same address,
-- address_unique constraint will be removed below
CREATE TABLE IF NOT EXISTS db_user (
	id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	f_name text NOT NULL,
	l_name text NOT NULL,
	email text NOT NULL UNIQUE,
	password_hash text NOT NULL,
	house_number integer,
	street_name text,
	city text,
	country text,
	is_admin boolean DEFAULT FALSE,
	is_contributor boolean DEFAULT FALSE,
		CONSTRAINT address_unique UNIQUE (house_number, street_name, city, country)
);

-- replace "" values with NULL
CREATE function replace_empty_str_with_null() 
RETURNS trigger as 
$$ begin 
	new.house_number = NULLIF(new.house_number, 0);
	new.street_name = NULLIF(new.street_name, '');
	new.city = NULLIF(new.city, '');
	new.country = NULLIF(new.country, '');
return new;
end;
$$ language plpgsql;

CREATE TRIGGER null_instead_of_empty_str before
UPDATE
	or
INSERT
	ON db_user for each row execute procedure replace_empty_str_with_null();
	
select * from db_user where email = 'aa@aa.aa';
ALTER TABLE db_user
DROP CONSTRAINT if exists address_unique;

