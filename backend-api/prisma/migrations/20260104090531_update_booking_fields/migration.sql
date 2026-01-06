/*
  Warnings:

  - You are about to drop the column `createdAt` on the `booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `createdAt`,
    ADD COLUMN `duration` VARCHAR(191) NOT NULL DEFAULT '15 Min',
    ADD COLUMN `peopleCount` INTEGER NOT NULL DEFAULT 2;
