SELECT 	
        purchase.id as "purchase_id",
        db_user.id as "user_id",
        db_user.email as "user_email", 
        db_user.f_name as "f_name",
        db_user.l_name as "l_name",
        purchase.placed_on,
        purchase.fulfilled_on,
        purchase.total,
	 	jsonb_build_array
		(
			album.id, album.name, album.colour,
			album.price, album.cover, album.band_name
		) as "album_info"
	FROM album
	LEFT JOIN album_purchase ON album.id = album_purchase.album_id
	LEFT JOIN purchase ON purchase.id = album_purchase.purchase_id
	LEFT JOIN db_user ON db_user.id = purchase.user_id
	WHERE purchase.id IS NOT NULL
-- 	FK why this is necessary
-- 	WHERE purchase.user_id = 12
    ORDER BY db_user.id ASC,
    purchase.placed_on DESC;
   	--user id, then latest orders first
   	
   	
 -- and a bit of Godflesh
 INSERT INTO genre(name)
VALUES ('industrial metal');

INSERT INTO label(name)
values ('Avalanche Recordings'), ('Earache Records');

INSERT into band (name, country) values ('Godflesh', 'UK');

INSERT INTO album (name, band_name, label_name, cover, release_year, 
				  colour, summary, duration, format, quantity, price)				  
VALUES (
'Songs of Love and Hate', 
'Godflesh', 
'Earache Records',
'https://www.metal-archives.com/images/1/9/4/5/19451.jpg',
1996, 
'blue',
'One of my all-time favourites.',
'71:52', 
'12"',
11,
44.88
);

INSERT INTO album (name, band_name, label_name, cover, release_year, 
				  colour, summary, duration, format, quantity, price)				  
VALUES (
'Purge', 
'Godflesh', 
'Avalanche Recordings',
'https://www.metal-archives.com/images/1/1/2/0/1120054.jpg',
2023, 
'grey',
'Instant classic.',
'55:55', 
'12"',
11,
26.88
);








