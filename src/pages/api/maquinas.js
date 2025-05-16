// pages/api/maquinas.js
import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Buscar máquinas e incluir as paradas e seções associadas
      const maquinas = await prisma.maquina.findMany({
        include: {
          paradas: true, // Incluir as paradas associadas a cada máquina
          secao: true, // Incluir a seção associada a cada máquina
        },
      });
      res.status(200).json(maquinas); // Retornar as máquinas com suas paradas e seções
    } catch (error) {
      console.error("Erro ao buscar máquinas:", error);
      res.status(500).json({ message: "Erro ao buscar máquinas" });
    }
  } else if (req.method === "POST") {
    try {
      const { nome, secaoId } = req.body;
      const novaMaquina = await prisma.maquina.create({
        data: {
          nome: nome,
          secaoId: secaoId || undefined, // Adicionar secaoId se fornecido
          funcionando: true, // ou o valor padrão que você deseja
        },
      });
      res.status(201).json(novaMaquina); // Retornar a nova máquina criada
    } catch (error) {
      console.error("Erro ao criar máquina:", error);
      res.status(500).json({ message: "Erro ao criar máquina" });
    }
  } else {
    // Método HTTP não permitido
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
