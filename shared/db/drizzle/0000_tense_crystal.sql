CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`total_budget` real NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`min_per_day` real,
	`max_per_day` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `challenges_user_id_idx` ON `challenges` (`user_id`);--> statement-breakpoint
CREATE TABLE `pots` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`day_date` text NOT NULL,
	`amount` real NOT NULL,
	`opened_at` text,
	`actual_spent` real,
	`status` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pots_challenge_id_idx` ON `pots` (`challenge_id`);--> statement-breakpoint
CREATE INDEX `pots_day_date_idx` ON `pots` (`day_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `pots_challenge_day_unique` ON `pots` (`challenge_id`,`day_date`);