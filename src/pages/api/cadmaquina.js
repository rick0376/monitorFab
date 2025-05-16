// pages/api/cadmaquina.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const maquinas = await prisma.maquina.findMany({
          include: {
            secao: true,
          },
          orderBy: { nome: "asc" },
        });
        res.status(200).json(maquinas);
      } catch (error) {
        console.error("Erro ao buscar máquinas:", error);
        res.status(500).json({ message: "Erro ao buscar máquinas" });
      }
      break;

    case "POST":
      try {
        const { nome, secaoId, funcionando } = req.body;

        if (!nome || !nome.trim()) {
          return res
            .status(400)
            .json({ message: "O nome da máquina é obrigatório" });
        }

        if (!secaoId) {
          return res.status(400).json({ message: "A seção é obrigatória" });
        }

        // Verificar se a seção existe
        const secao = await prisma.secao.findUnique({
          where: { id: secaoId },
        });

        if (!secao) {
          return res.status(404).json({ message: "Seção não encontrada" });
        }

        const maquina = await prisma.maquina.create({
          data: {
            nome,
            secaoId,
            funcionando: funcionando ?? true,
          },
        });

        res.status(201).json(maquina);
      } catch (error) {
        console.error("Erro ao criar máquina:", error);
        res.status(500).json({ message: "Erro ao cadastrar máquina" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
