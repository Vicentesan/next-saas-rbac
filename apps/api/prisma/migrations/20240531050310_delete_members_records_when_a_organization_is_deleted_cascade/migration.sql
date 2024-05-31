-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_organizationId_fkey";

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
