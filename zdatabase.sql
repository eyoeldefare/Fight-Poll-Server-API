 CREATE TABLE account(
 	account_id bigserial PRIMARY KEY,

 	account_name text,
 	account_email text UNIQUE NOT NULL,
 	account_username text UNIQUE NOT NULL,
 	account_password text NOT NULL,
 	account_created_date timestamp NOT NULL,
    account_profile_info text DEFAULT 'profile...',
 	account_profile_image text DEFAULT 'default.png'
 );

 INSERT INTO account (account_name, account_email, account_username, account_password, account_created_date, account_profile_info)
 VALUES('java', 'java@gmail.com', 'java78', 'java123', '2018-09-8','Whats good hommies');
 INSERT INTO account (account_name, account_email, account_username, account_password, account_created_date)
 VALUES('nodejs', 'nodejs@gmail.com', 'nodejs19', 'nodejs123', '2018-09-28','Whats good hommies');
 INSERT INTO account (account_name, account_email, account_username, account_password, account_created_date)
 VALUES('sql', 'sql@gmail.com', 'sql3', 'sql123', '2018-02-12','Whats good hommies');
 INSERT INTO account (account_name, account_email, account_username, account_password, account_created_date)
 VALUES('python', 'python@gmail.com', 'python23', 'python123', '2018-08-11','I suck');

CREATE TABLE poll_checked (
	checked_id bigserial PRIMARY KEY,
	poll_id integer NOT NULL,
	voter_account_id integer NOT NULL,
	checked integer DEFAULT 0
);

INSERT INTO poll_checked (poll_id, voter_account_id, checked) VALUES (1,1,1);
INSERT INTO poll_checked (poll_id, voter_account_id, checked) VALUES (2,2,2);
INSERT INTO poll_checked (poll_id, voter_account_id, checked) VALUES (4,3,3);
INSERT INTO poll_checked (poll_id, voter_account_id) VALUES (6,4);
INSERT INTO poll_checked (poll_id, voter_account_id, checked) VALUES (8,7,4);
INSERT INTO poll_checked (poll_id, voter_account_id, checked) VALUES (9,8,1);



CREATE TABLE poll(
	poll_id bigserial PRIMARY KEY,
	poll_creator_id integer NOT NULL,
  	poll_voters_ids integer[] DEFAULT ARRAY[1],

	poll_title text NOT NULL,
	poll_created_date timestamp NOT NULL,
	poll_fighter1 text NOT NULL,
	poll_fighter2 text NOT NULL,
	poll_image text,
	poll_status boolean DEFAULT false,

	poll_votes_for_fighter1 integer DEFAULT 0,
	poll_votes_for_fighter2 integer DEFAULT 0,
	poll_votes_for_draw integer DEFAULT 0,
	poll_votes_for_canceled integer DEFAULT 0,
  	view integer DEFAULT 0
);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled)
VALUES(1,'Who wins between Canelo vs Floyd?', '2018-02-1', 'Canelo', 'Floyd', 'https://s.hdnux.com/photos/51/15/04/10801425/5/920x920.jpg', false,294, 90,2,1);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2,poll_votes_for_draw, poll_votes_for_canceled)
VALUES(1,'Who wins between Thomas vs Manny?', '2018-09-2', 'Thomas', 'Manny', 'http://media.ufc.tv/migrated_images/C98CF5B1-1422-0E8C-9AD3F7A4CEC02411.jpg', false,2345, 943,2,1);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_canceled)
VALUES(2,'Who wins between Dude1 vs Dude2?', '2018-1-20', 'Dude1', 'Dude2', 'https://s.hdnux.com/photos/74/37/60/15858728/5/920x920.jpg', true,100, 200,1);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_canceled)
VALUES(3,'Who wins between Donald vs Perry?', '2018-03-2', 'Donald', 'Perry', 'https://cdnph.upi.com/th/upi/a5486993270ea596a8667c3eaff05ea8/UFC-205-press-event-at-Madison-Square-Garden_th_2_1.jpg', false,12, 32,1);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled)
VALUES(1,'Who wins between Tyson vs Hollyfield?', '2018-12-2', 'Tyson', 'Hollyfield', 'https://s.hdnux.com/photos/74/37/60/15858728/5/920x920.jpg', true,123, 321,1,1);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2)
VALUES(1,'Who wins between Ali vs AJ?', '2018-07-21', 'Ali', 'AJ', 'http://www2.cdn.sherdog.com/_images/pictures/20130215095548_IMG_0679.JPG', false,982, 731);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2)
VALUES(5,'Who wins between Jon Jones vs DC?', '2018-11-11', 'Jone Jones', 'DC', 'https://cdn.vox-cdn.com/thumbor/eDWqE9tKZOx2Pl-CqlNFtoRzC6M=/0x0:2473x1649/1200x800/filters:focal(0x0:2473x1649)/cdn.vox-cdn.com/uploads/chorus_image/image/47219574/usa-today-8353652.0.jpg', true,12, 12);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled)
VALUES(4,'Who wins between Tyron vs GSP?', '2018-07-2', 'GSP', 'Tyron', 'http://cdn2.cagepotato.com/wp-content/uploads/Sonnen.jpg', false,5, 3,2,1);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled)
VALUES(3,'Who wins between Kevin Lee vs Khabib?', '2018-2-2', 'Kevin Lee', 'Khabib', 'https://asset-sports.abs-cbn.com/web/media/articles/1435719703_mcgregor-cocky1.jpg', false,123, 23,20,11);

INSERT INTO poll (poll_creator_id, poll_title, poll_created_date, poll_fighter1, poll_fighter2, poll_image, poll_status,poll_votes_for_fighter1, poll_votes_for_fighter2, poll_votes_for_draw, poll_votes_for_canceled)
VALUES(4,'Who wins between Conor vs Floyd?', '2018-08-23','Conor', 'Floyd', 'http://media.ufc.tv/migrated_images/91ED836A-1422-0E8C-9A99B334EE8E7C14.jpg', true,24, 90,21,11);


CREATE TABLE comment(
	comment_id bigserial PRIMARY KEY,
  	reply_id integer,
	parent_comment_id integer,
	poll_id integer NOT NULL,

	comment_creator_account_id integer NOT NULL,
	comment_created_date timestamp NOT NULL,
	comment_info text,
	comment_likes integer DEFAULT 0
);

INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(1,1,'2018-03-7', 'I really do love commenting on these polls.', 1001);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(2,1,'2018-09-21', 'Commenting is the best thing in the world hahaha',33);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(3,1,'2018-01-13', 'Its a bit difficult to implement this in the server I bet',0);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(4,1,'2018-09-2', 'This comment will be number one in the future.',111);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(5,1, '2018-01-5','Oh my', 90);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(6,1,'2018-05-25', 'Haha I am commenting because I can', 12);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(7,1, '2018-03-30','Man it seem to be long to do this', 5);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(8,1,'2018-01-30','How many data entries left until we are done?',45);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(9,1, '2018-06-21','Oh yeah, only 1 left, I rock', 2);
INSERT INTO comment(comment_creator_account_id,poll_id, comment_created_date, comment_info, comment_likes)VALUES(10, 1,'2018-07-11', 'Finally, new Done();',1);
INSERT INTO comment(reply_id,comment_creator_account_id,poll_id,parent_comment_id, comment_created_date, comment_info, comment_likes)VALUES(1,10,2,1, '2018-07-11', 'Finally, new Done();',11);
INSERT INTO comment(reply_id,comment_creator_account_id,poll_id, parent_comment_id,  comment_created_date, comment_info, comment_likes)VALUES(11,1,2,1, '2018-07-11', 'Finally, new Done();',9);
INSERT INTO comment(reply_id,comment_creator_account_id,poll_id,parent_comment_id, comment_created_date, comment_info, comment_likes)VALUES(12,2,2,1, '2018-07-11', 'Finally, new Done();',4);
INSERT INTO comment(reply_id,comment_creator_account_id,poll_id, parent_comment_id,  comment_created_date, comment_info, comment_likes)VALUES(2,3,2,2, '2018-07-5', 'Finally, new Done();',3);
INSERT INTO comment(reply_id,comment_creator_account_id,poll_id,parent_comment_id, comment_created_date, comment_info, comment_likes)VALUES(2,4,3, 2,'2018-03-8', 'Finally, new Done();',2);


CREATE TABLE notification(
  notification_id bigserial PRIMARY KEY,
  notification_to_user_id integer,
  notification_from_id integer,
  notification_poll_id integer,
  notification_message text,
  notification_created_date timestamp NOT NULL,
  notification_read boolean DEFAULT false,
  notification_comment boolean NOT NULL
);
