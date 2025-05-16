/*
  Warnings:

  - The `tempoIntervencao` column on the `Parada` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Parada" DROP COLUMN "tempoIntervencao",
ADD COLUMN     "tempoIntervencao" TIMESTAMP(3);
