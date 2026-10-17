ALTER TABLE `images` ADD `generated` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `visual_status` text DEFAULT 'idle' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `visual_requested` integer;--> statement-breakpoint
ALTER TABLE `projects` ADD `visual_error` text;