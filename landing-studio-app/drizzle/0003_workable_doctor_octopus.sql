CREATE INDEX `clicks_project_test_created` ON `clicks` (`project`,`test`,`created`);--> statement-breakpoint
CREATE INDEX `clicks_session` ON `clicks` (`session`);--> statement-breakpoint
CREATE INDEX `images_owner_created` ON `images` (`owner`,`created`);--> statement-breakpoint
CREATE INDEX `orders_project_test_created` ON `orders` (`project`,`test`,`created`);--> statement-breakpoint
CREATE INDEX `orders_project_phone_created` ON `orders` (`project`,`phone`,`created`);--> statement-breakpoint
CREATE INDEX `projects_owner_updated` ON `projects` (`owner`,`updated`);--> statement-breakpoint
CREATE INDEX `projects_queue` ON `projects` (`status`,`queued`);--> statement-breakpoint
CREATE INDEX `sessions_project_test_started` ON `sessions` (`project`,`test`,`started`);