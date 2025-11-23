-- CreateTable
CREATE TABLE "ProjectPictureGrid" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "columns" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectPictureGrid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectGridPicture" (
    "id" TEXT NOT NULL,
    "gridId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectGridPicture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectPictureGrid_projectId_idx" ON "ProjectPictureGrid"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPictureGrid_position_idx" ON "ProjectPictureGrid"("position");

-- CreateIndex
CREATE INDEX "ProjectGridPicture_gridId_idx" ON "ProjectGridPicture"("gridId");

-- AddForeignKey
ALTER TABLE "ProjectPictureGrid" ADD CONSTRAINT "ProjectPictureGrid_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectGridPicture" ADD CONSTRAINT "ProjectGridPicture_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "ProjectPictureGrid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
