/*
  Warnings:

  - A unique constraint covering the columns `[projectId,userId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "actualHours" DOUBLE PRECISION,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Sprint_status_idx" ON "Sprint"("status");

-- CreateIndex
CREATE INDEX "Sprint_startDate_endDate_idx" ON "Sprint"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- CreateIndex
CREATE INDEX "Ticket_startDate_idx" ON "Ticket"("startDate");

-- CreateIndex
CREATE INDEX "Ticket_dueDate_idx" ON "Ticket"("dueDate");

-- CreateIndex
CREATE INDEX "Ticket_completedAt_idx" ON "Ticket"("completedAt");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_parentTicketId_fkey" FOREIGN KEY ("parentTicketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
