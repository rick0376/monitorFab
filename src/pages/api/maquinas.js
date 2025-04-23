import { prisma } from "../../lib/prisma"; // Certifique-se de que o caminho está correto para o prisma

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Buscar máquinas e incluir as paradas associadas a elas
      const maquinas = await prisma.maquina.findMany({
        include: {
          paradas: true, // Incluir as paradas associadas a cada máquina
        },
      });
      res.status(200).json(maquinas); // Retornar as máquinas com suas paradas
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar máquinas" });
    }
  } else if (req.method === "POST") {
    try {
      const { nome } = req.body;
      const novaMaquina = await prisma.maquina.create({
        data: {
          nome: nome,
          funcionando: true, // ou o valor padrão que você deseja
        },
      });
      res.status(201).json(novaMaquina); // Retornar a nova máquina criada
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar máquina" });
    }
  } else {
    // Método HTTP não permitido
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
