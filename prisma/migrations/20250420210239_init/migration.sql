-- CreateTable
CREATE TABLE "Maquina" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Maquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parada" (
    "id" SERIAL NOT NULL,
    "maquinaId" INTEGER NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "equipeAtuando" TEXT NOT NULL,
    "horaFinalizacao" TIMESTAMP(3),
    "observacao" TEXT NOT NULL,

    CONSTRAINT "Parada_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Parada" ADD CONSTRAINT "Parada_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "Maquina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
