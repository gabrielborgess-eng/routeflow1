CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(24) NOT NULL,
	`client` varchar(160) NOT NULL,
	`deliveryAddress` text NOT NULL,
	`zone` varchar(80) NOT NULL,
	`weightKg` int NOT NULL,
	`distanceKm` decimal(8,2) NOT NULL,
	`deliveryWindow` varchar(40) NOT NULL,
	`priority` enum('normal','high') NOT NULL DEFAULT 'normal',
	`status` enum('pending','in_route','scheduled','delivered') NOT NULL DEFAULT 'pending',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`plate` varchar(12) NOT NULL,
	`type` varchar(80) NOT NULL,
	`capacityKg` int NOT NULL,
	`currentLoadKg` int NOT NULL DEFAULT 0,
	`status` enum('available','in_route','maintenance') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_plate_unique` UNIQUE(`plate`)
);
