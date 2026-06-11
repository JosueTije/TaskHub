-- DropIndex
DROP INDEX "ticket_embedding_hnsw_idx";

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "snapshotCompletedSP" INTEGER,
ADD COLUMN     "snapshotCompletedTickets" INTEGER,
ADD COLUMN     "snapshotTotalSP" INTEGER,
ADD COLUMN     "snapshotTotalTickets" INTEGER;
