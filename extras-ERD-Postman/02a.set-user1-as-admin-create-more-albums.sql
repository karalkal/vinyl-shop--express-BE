UPDATE db_user
SET is_admin = true, is_contributor= true
WHERE id = 1;

INSERT INTO label (name) VALUES ('Columbia');
INSERT INTO label (name) VALUES ('EMI');
INSERT INTO label (name) VALUES ('Nuclear Blast');
INSERT INTO label (name) VALUES ('Pelagic');


INSERT INTO album(name, cover, release_year, band_name, label_name) VALUES
('Dirt',
 'https://upload.wikimedia.org/wikipedia/en/f/f9/Dirt_%28Alice_in_Chains_album_-_cover_art%29.jpg',
 1992,
'Alice In Chains',
'Columbia');

INSERT INTO album(name, cover, release_year, band_name, label_name) VALUES
('Facelift',
 'https://upload.wikimedia.org/wikipedia/en/4/43/Alice_In_Chains-Facelift.jpg',
 1990,
'Alice In Chains',
'Columbia'),

('Alice In Chains',
 'https://upload.wikimedia.org/wikipedia/en/2/24/Alice_in_Chains_%28album%29.jpg',
 1995,
'Alice In Chains',
'Columbia'),

('jar of flies',
 'https://upload.wikimedia.org/wikipedia/en/1/15/Alice_in_Chains_Jar_of_Flies.jpg',
 1994,
'Alice In Chains',
'Columbia');

insert into band (name, country) values ('pink floyd', 'uk');


INSERT INTO album(name, cover, release_year, band_name, label_name) VALUES
('Animals',
 'https://upload.wikimedia.org/wikipedia/en/7/74/Pink_Floyd-Animals-Frontal.jpg',
 1977,
'Pink Floyd',
'Emi'),

('Obscured by Clouds',
 'https://upload.wikimedia.org/wikipedia/en/e/ef/Pink_Floyd_-_Obscured_by_Clouds.jpg',
 1972,
'Pink Floyd',
'Emi'),

('Wish You Were Here',
 'https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png',
 1975,
'Pink Floyd',
'Emi');

INSERT INTO album(name, cover, release_year, band_name, label_name,
summary,	
duration,
format,	
colour,
quantity,
price
) VALUES
('Wish You Were Here',
 'https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png',
 1975,
'Pink Floyd',
'Emi',
'Wish You Were Here is the ninth studio album by the English rock band Pink Floyd, released on 12 September 1975 through Harvest Records in the UK and Columbia Records in the US, their first for the label. Based on material Pink Floyd composed while performing in Europe, Wish You Were Here was recorded over numerous sessions throughout 1975 at EMI Studios in London.
The lyrics express alienation and criticism of the music business. The bulk of the album is taken up by "Shine On You Crazy Diamond", a nine-part tribute to the Pink Floyd co-founder Syd Barrett, who had left seven years earlier due to his deteriorating mental health.',
44.05,
'lp',
'blue',
11,
44
);

INSERT INTO album(name, cover, release_year, band_name, label_name,
summary,	
duration,
format,	
colour,
quantity,
price
) VALUES
('Wish You Were Here',
 'https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png',
 1975,
'Pink Floyd',
'Emi',
'Wish You Were Here is the ninth studio album by the English rock band Pink Floyd, released on 12 September 1975 through Harvest Records in the UK and Columbia Records in the US, their first for the label. Based on material Pink Floyd composed while performing in Europe, Wish You Were Here was recorded over numerous sessions throughout 1975 at EMI Studios in London.
The lyrics express alienation and criticism of the music business. The bulk of the album is taken up by "Shine On You Crazy Diamond", a nine-part tribute to the Pink Floyd co-founder Syd Barrett, who had left seven years earlier due to his deteriorating mental health.',
44.05,
'lp',
'red',
8,
35
);

INSERT INTO album(name, cover, release_year, band_name, label_name,
summary,	
duration,
format,	
colour,
quantity,
price
) VALUES
('Welcome to Sky Valley',
 'https://upload.wikimedia.org/wikipedia/en/9/91/Kyuss_Welcome_to_Sky_Valley.jpg',
 1994,
'Kyuss',
'Electra',
'Welcome to Sky Valley has been described as stoner rock and stoner metal. This is the first Kyuss album to feature bassist Scott Reeder, who replaced Nick Oliveri in 1992. Welcome to Sky Valley was the last to feature founding member Brant Bjork.',
51.55,
'lp',
'transparent',
8,
31
);

INSERT INTO album(name, cover, release_year, band_name, label_name,
summary,	
duration,
format,	
colour,
quantity,
price
) VALUES
('Holocene',
 'https://upload.wikimedia.org/wikipedia/en/7/70/TheOceanHolocene.jpg',
 2023,
'The Ocean',
'Pelagic',
'Holocene is the ninth studio album by German post-metal band the Ocean, released on 19 May 2023 through Pelagic Records and produced by Daniel Lidén.',
52.44,
'lp',
'white',
8,
33.33
),

('Holocene',
 'https://upload.wikimedia.org/wikipedia/en/7/70/TheOceanHolocene.jpg',
 2023,
'The Ocean',
'Pelagic',
'Holocene is the ninth studio album by German post-metal band the Ocean, released on 19 May 2023 through Pelagic Records and produced by Daniel Lidén.',
52.44,
'lp',
'black',
17,
26.53
);



INSERT INTO album(name, cover, release_year, band_name, label_name,
colour, quantity, price) VALUES
('the arrival',
 'https://upload.wikimedia.org/wikipedia/en/d/dc/The_Arrival_-_Hypocrisy.jpg',
 2004,
'Hypocrisy',
'Nuclear Blast',
'white', 8, 33.33
),

('Into the Abyss',
 'https://upload.wikimedia.org/wikipedia/en/9/98/Into_the_abyss.jpg',
 2000,
'Hypocrisy',
'Nuclear Blast',
'red', 4, 33.55
);






