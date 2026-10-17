CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`project` text NOT NULL,
	`section` text NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`device` text NOT NULL,
	`created` integer NOT NULL,
	`test` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`type` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`session` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`address` text NOT NULL,
	`quantity` integer NOT NULL,
	`status` text DEFAULT 'Nouveau' NOT NULL,
	`created` integer NOT NULL,
	`test` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_session_unique` ON `orders` (`session`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`email` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published` text,
	`published_revision` integer,
	`publish_data` text,
	`queued` integer,
	`error` text,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`visitor` text NOT NULL,
	`started` integer NOT NULL,
	`seen` integer NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`cta` integer DEFAULT 0 NOT NULL,
	`form` integer DEFAULT 0 NOT NULL,
	`viewed` integer DEFAULT 0 NOT NULL,
	`submitted` integer DEFAULT 0 NOT NULL,
	`device` text NOT NULL,
	`test` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
