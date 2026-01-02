-- CreateTable
CREATE TABLE `Loan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `toolName` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `borrowDate` DATETIME(3) NOT NULL,
    `returnDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'dipinjam',
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Loan` ADD CONSTRAINT `Loan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
