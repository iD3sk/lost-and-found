-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'CLAIM_PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('ELECTRONICS', 'ACCESSORIES', 'DOCUMENTS', 'BAGS', 'CLOTHING', 'BOTTLES', 'VEHICLES', 'OTHERS');

-- CreateEnum
CREATE TYPE "CampusLocationType" AS ENUM ('AREA', 'BUILDING');

-- CreateTable
CREATE TABLE "USER" (
    "npm" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "contact" TEXT,

    CONSTRAINT "USER_pkey" PRIMARY KEY ("npm")
);

-- CreateTable
CREATE TABLE "REPORT" (
    "id" UUID NOT NULL,
    "userNpm" TEXT NOT NULL,
    "report_location" UUID NOT NULL,
    "type" "ReportType" NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "lostFrom" TIMESTAMP(3),
    "lostUntil" TIMESTAMP(3),
    "foundDate" DATE,
    "foundTime" TIME(0),
    "currentPosition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "REPORT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "REPORT_IMAGE" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "REPORT_IMAGE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LOCATION" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "location_detail" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),

    CONSTRAINT "LOCATION_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAMPUS_LOCATION" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampusLocationType" NOT NULL,

    CONSTRAINT "CAMPUS_LOCATION_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COMMENT" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "userNpm" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "COMMENT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOTIFICATION" (
    "id" UUID NOT NULL,
    "userNpm" TEXT NOT NULL,
    "reportId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NOTIFICATION_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "REPORT_report_location_key" ON "REPORT"("report_location");

-- AddForeignKey
ALTER TABLE "REPORT" ADD CONSTRAINT "REPORT_userNpm_fkey" FOREIGN KEY ("userNpm") REFERENCES "USER"("npm") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REPORT" ADD CONSTRAINT "REPORT_report_location_fkey" FOREIGN KEY ("report_location") REFERENCES "LOCATION"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REPORT_IMAGE" ADD CONSTRAINT "REPORT_IMAGE_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "REPORT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOCATION" ADD CONSTRAINT "LOCATION_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "CAMPUS_LOCATION"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMMENT" ADD CONSTRAINT "COMMENT_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "REPORT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMMENT" ADD CONSTRAINT "COMMENT_userNpm_fkey" FOREIGN KEY ("userNpm") REFERENCES "USER"("npm") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTIFICATION" ADD CONSTRAINT "NOTIFICATION_userNpm_fkey" FOREIGN KEY ("userNpm") REFERENCES "USER"("npm") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTIFICATION" ADD CONSTRAINT "NOTIFICATION_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "REPORT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
