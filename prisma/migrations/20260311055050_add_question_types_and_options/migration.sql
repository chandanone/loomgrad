-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('CODING', 'MCQ_SINGLE', 'MCQ_MULTI', 'FILL_BLANK');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'CODING';

-- CreateTable
CREATE TABLE "ChallengeOption" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "ChallengeOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengeOption_challengeId_idx" ON "ChallengeOption"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeOption_challengeId_orderIndex_key" ON "ChallengeOption"("challengeId", "orderIndex");

-- AddForeignKey
ALTER TABLE "ChallengeOption" ADD CONSTRAINT "ChallengeOption_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
