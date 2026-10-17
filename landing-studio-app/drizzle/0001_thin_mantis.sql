ALTER TABLE `projects` ADD `ai_status` text DEFAULT 'idle' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `ai_requested` integer;--> statement-breakpoint
ALTER TABLE `projects` ADD `ai_base` integer;--> statement-breakpoint
ALTER TABLE `projects` ADD `ai_error` text;