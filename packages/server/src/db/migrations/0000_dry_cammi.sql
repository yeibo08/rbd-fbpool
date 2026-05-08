CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short` text NOT NULL,
	`flag_emoji` text NOT NULL,
	`group_letter` text NOT NULL,
	`flag_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_group_members_user` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text NOT NULL,
	`invite_token` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_invite_token_unique` ON `groups` (`invite_token`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`match_number` integer NOT NULL,
	`stage` text NOT NULL,
	`group_letter` text,
	`home_team_code` text,
	`away_team_code` text,
	`home_team_label` text NOT NULL,
	`away_team_label` text NOT NULL,
	`kickoff_at` text NOT NULL,
	`venue_id` integer,
	`home_goals` integer,
	`away_goals` integer,
	`went_to_penalties` integer DEFAULT 0 NOT NULL,
	`penalty_winner_code` text,
	`result_fetched_at` text,
	FOREIGN KEY (`home_team_code`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`away_team_code`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matches_match_number_unique` ON `matches` (`match_number`);--> statement-breakpoint
CREATE INDEX `idx_matches_kickoff` ON `matches` (`kickoff_at`);--> statement-breakpoint
CREATE INDEX `idx_matches_stage` ON `matches` (`stage`);--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`group_id` text NOT NULL,
	`match_id` text NOT NULL,
	`home_goals` integer NOT NULL,
	`away_goals` integer NOT NULL,
	`submitted_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_prediction` ON `predictions` (`user_id`,`group_id`,`match_id`);--> statement-breakpoint
CREATE INDEX `idx_predictions_match` ON `predictions` (`match_id`);--> statement-breakpoint
CREATE INDEX `idx_predictions_group_user` ON `predictions` (`group_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `scoring_rules` (
	`group_id` text PRIMARY KEY NOT NULL,
	`pts_correct_result` integer DEFAULT 1 NOT NULL,
	`pts_correct_home` integer DEFAULT 1 NOT NULL,
	`pts_correct_away` integer DEFAULT 1 NOT NULL,
	`pts_correct_total` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`force_password_change` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `venues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL
);
