/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `platforms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `platforms_slug_key` ON `platforms`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `projects_slug_key` ON `projects`(`slug`);
