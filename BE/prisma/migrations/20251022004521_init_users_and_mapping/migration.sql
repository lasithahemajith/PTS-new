/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('Student', 'Mentor', 'Tutor') NOT NULL DEFAULT 'Student';

-- CreateTable
CREATE TABLE `MentorStudentMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mentorId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MentorStudentMap_mentorId_idx`(`mentorId`),
    INDEX `MentorStudentMap_studentId_idx`(`studentId`),
    UNIQUE INDEX `MentorStudentMap_mentorId_studentId_key`(`mentorId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorStudentMap` ADD CONSTRAINT `MentorStudentMap_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorStudentMap` ADD CONSTRAINT `MentorStudentMap_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
