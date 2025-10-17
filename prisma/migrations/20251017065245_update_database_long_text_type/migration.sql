-- AlterTable
ALTER TABLE `chats` MODIFY `clientQuery` TEXT NOT NULL,
    MODIFY `chatTranscript` TEXT NULL,
    MODIFY `reviewText` TEXT NULL,
    MODIFY `clientFeedback` TEXT NULL,
    MODIFY `storeDetails` TEXT NULL,
    MODIFY `featureRequest` TEXT NULL,
    MODIFY `agentComments` TEXT NULL,
    MODIFY `otherStoresUrl` TEXT NULL,
    MODIFY `changesMadeByAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `marketing_funnels` MODIFY `initialFeedback` TEXT NULL;

-- AlterTable
ALTER TABLE `meetings` MODIFY `storeUrl` TEXT NOT NULL,
    MODIFY `meetingDetails` TEXT NULL,
    MODIFY `reviewsInfo` TEXT NULL,
    MODIFY `recordedVideo` TEXT NULL,
    MODIFY `meetingNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `tasks` MODIFY `taskDetails` TEXT NOT NULL,
    MODIFY `reply` TEXT NULL,
    MODIFY `comments` TEXT NULL;
