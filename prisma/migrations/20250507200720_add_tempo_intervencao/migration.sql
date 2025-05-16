/*
  Warnings:

  - Added the required column `tempoIntervencao` to the `Parada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parada" DROP COLUMN "tempoIntervencao",
ADD COLUMN     "tempoIntervencao" INTEGER NOT NULL;
