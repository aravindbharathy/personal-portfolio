-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "findingsHeading" TEXT NOT NULL DEFAULT 'Key Findings & Insights',
ADD COLUMN     "impactHeading" TEXT NOT NULL DEFAULT 'Impact & Outcomes',
ADD COLUMN     "methodologyHeading" TEXT NOT NULL DEFAULT 'Methodology & Approach',
ADD COLUMN     "objectivesHeading" TEXT NOT NULL DEFAULT 'Research Objectives';
