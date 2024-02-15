-- duration of album must be in format mm:ss, hence string not integer
ALTER TABLE album
ALTER COLUMN duration
TYPE VARCHAR(11);

select * from band;
INSERT into band (name, country) values ('Prison of Mirrors', 'Italy');
INSERT into label (name) values('Oration');

INSERT INTO album (name, band_name, label_name, cover, release_year, 
				  colour, summary, duration, format, quantity, price)
VALUES (
'De Ritualibus et Sacrificiis ad Serviendum Abysso', 
'Prison Of Mirrors', 
'Oration',
'https://www.metal-archives.com/images/8/3/3/8/833822.jpg',
2020, 
'black',
'It took me a while to finish this review. I needed to go through the whole album a few times before I was ready to finally make up my mind, but it surely was worth it. Prison of Mirrors are an Italian outfit, and after having released two EPs they have recently hit the scene with their full length debut “De Ritualibus et Sacrificiis ad Serviendum Abysso”. Diving into this album feels a bit like being drawn into the void and being spit out again, having brought something dark and unsettling with you back to our world that is going to stick with you for a long time.
This group have an almost hellish, ritual worship atmosphere to their music that proves to be one of their main assets. At times, the swirling maelstrom of rapid down-picks and tremolo riffs proves somewhat overwhelming, and fans who expect catchy melodies and simple song structures might look elsewhere. Only four tracks but nearly 54 minutes of playing time is what is on offer here, giving potential listeners a hint that we are not talking about easy listening. That being said Prison of Mirrors always manage to keep their songs stringent and flowing, with each consecutive section of a track being a natural progression of the former parts. This should not come as surprise with some of the members being active in other outfits as well, leading to an end product showing a lot of professionalism and maturity.',
'53.52', 
'12"',
11,
35.88
);

select id, price  from album;
UPDATE album
SET price = 44.44
WHERE id='1';

-- price will be NOT NULL
ALTER TABLE album ALTER COLUMN price SET NOT NULL;

-- allow house numbers to be strings, e.g. 44a or 2-B
ALTER TABLE db_user
ALTER COLUMN house_number
TYPE text;

-- need to drop and recreate trigger and function too as it checks for 0 to cast to NULL
DROP TRIGGER null_instead_of_empty_str ON db_user;
DROP FUNCTION if exists replace_empty_str_with_null;

-- replace "" values with NULL
CREATE function replace_empty_str_with_null() 
RETURNS trigger as 
$$ begin 
	new.house_number = NULLIF(new.house_number, '');
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

INSERT into db_user(
	f_name, l_name, email, password_hash, 
	house_number, street_name, city, country, 
	is_admin, is_contributor
)
	VALUES(
		'aaaa', 'aaaa', 'aa@aa.aa', 'aaaa',		
		'4', 'big street', 'London', 'France',
		true, true					)



