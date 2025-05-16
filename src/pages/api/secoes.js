// pages/api/secoes.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Determinar qual método HTTP está sendo usado
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const secoes = await prisma.secao.findMany({
          orderBy: { nome: "asc" },
        });
        res.status(200).json(secoes);
      } catch (error) {
        console.error("Erro ao buscar seções:", error);
        res.status(500).json({ message: "Erro ao buscar seções" });
      }
      break;

    case "POST":
      try {
        const { nome } = req.body;

        if (!nome || !nome.trim()) {
          return res
            .status(400)
            .json({ message: "O nome da seção é obrigatório" });
        }

        const secao = await prisma.secao.create({
          data: { nome },
        });

        res.status(201).json(secao);
      } catch (error) {
        console.error("Erro ao criar seção:", error);
        res.status(500).json({ message: "Erro ao cadastrar seção" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
