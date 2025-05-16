/*
  Warnings:

  - Added the required column `funcionando` to the `Parada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parada" ADD COLUMN     "funcionando" BOOLEAN NOT NULL;
