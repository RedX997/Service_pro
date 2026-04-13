-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "assignedEmployee" TEXT,
ADD COLUMN     "lastContact" TIMESTAMP(3),
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "mobile" TEXT;
