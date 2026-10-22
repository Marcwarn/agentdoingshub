CREATE TABLE `hub_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`task_id` text NOT NULL,
	`event` text NOT NULL,
	`at` text NOT NULL,
	`detail` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_owner_idx` ON `hub_audit` (`owner`);--> statement-breakpoint
CREATE TABLE `hub_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`goal` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`metadata` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hub_owner_idx` ON `hub_tasks` (`owner`);