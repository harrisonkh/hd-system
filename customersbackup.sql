BEGIN TRANSACTION;
CREATE TABLE "Customers" (
	`ID`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`FName`	TEXT NOT NULL,
	`LName`	TEXT NOT NULL,
	`MobNum`	TEXT,
	`Email`	TEXT,
	`LanNum`	TEXT
);
INSERT INTO `Customers` (ID,FName,LName,MobNum,Email,LanNum) VALUES (0,'Harrison','Kuseskis-Hayes','0421167133','harrisonkh123@gmail.com','95600263'),
 (1,'Harrison','Kuseskis-Hayes','0421167133','harrisonkh123@gmail.com','95600263'),
 (2,'Harrison','Kuseskis-Hayes','0421167133','harrisonkh123@gmail.com','95600263'),
 (3,'Harrison','Kuseskis-Hayes','0421167133','harrisonkh123@gmail.com','95600263'),
 (4,'Harrison','Kuseskis-Hayes','0421167133','harrisonkh123@gmail.com','95600263'),
 (5,'Harrion','Kuseskis-Hayes','0421167133','harrisonkh123@gmail.com','95600263'),
 (6,'jayesh','malhotra','0426993164','jayeshmal96.com','97456724');
COMMIT;
