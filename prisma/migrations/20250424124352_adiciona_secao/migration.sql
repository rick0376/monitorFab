/*
  Warnings:

  - Added the required column `secaoId` to the `Maquina` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Maquina" ADD COLUMN     "secaoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Secao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Secao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Maquina" ADD CONSTRAINT "Maquina_secaoId_fkey" FOREIGN KEY ("secaoId") REFERENCES "Secao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
