-- CreateTable
CREATE TABLE "Contato" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "celular" TEXT NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contato_celular_key" ON "Contato"("celular");
