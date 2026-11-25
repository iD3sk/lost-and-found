-- CreateTable
CREATE TABLE "SESSION" (
    "tokenHash" CHAR(64) NOT NULL,
    "userNpm" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SESSION_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "PENDING_SSO_PROFILE" (
    "tokenHash" CHAR(64) NOT NULL,
    "userNpm" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facultyCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PENDING_SSO_PROFILE_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateIndex
CREATE INDEX "SESSION_userNpm_expiresAt_idx" ON "SESSION"("userNpm", "expiresAt");

-- CreateIndex
CREATE INDEX "PENDING_SSO_PROFILE_userNpm_expiresAt_idx" ON "PENDING_SSO_PROFILE"("userNpm", "expiresAt");

-- AddForeignKey
ALTER TABLE "SESSION" ADD CONSTRAINT "SESSION_userNpm_fkey" FOREIGN KEY ("userNpm") REFERENCES "USER"("npm") ON DELETE CASCADE ON UPDATE CASCADE;
