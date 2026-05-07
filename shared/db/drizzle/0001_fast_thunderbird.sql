CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`spent_on` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `expenses_challenge_id_idx` ON `expenses` (`challenge_id`);--> statement-breakpoint
CREATE INDEX `expenses_spent_on_idx` ON `expenses` (`spent_on`);