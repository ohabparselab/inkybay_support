-- DropForeignKey
ALTER TABLE `comment_mentions` DROP FOREIGN KEY `comment_mentions_commentId_fkey`;

-- DropIndex
DROP INDEX `comment_mentions_commentId_mentionedId_key` ON `comment_mentions`;
