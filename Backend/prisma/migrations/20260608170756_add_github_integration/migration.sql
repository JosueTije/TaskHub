-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubRepo" TEXT,
ADD COLUMN     "githubRepoUrl" TEXT;

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "githubBranch" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "githubBranch" TEXT,
ADD COLUMN     "githubPrNumber" INTEGER,
ADD COLUMN     "githubPrStatus" TEXT,
ADD COLUMN     "githubPrUrl" TEXT;
