import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const maquina = await prisma.maquina.findUnique({
        where: { id: parseInt(id) },
        include: { secao: true }, // Incluir dados da seção
      });
      if (!maquina) {
        return res.status(404).json({ message: "Máquina não encontrada" });
      }
      res.status(200).json(maquina);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar máquina" });
    }
  } else if (req.method === "PUT") {
    try {
      const { nome, funcionando, secaoId } = req.body;

      // Verificar se a seção existe (se fornecida)
      if (secaoId) {
        const secao = await prisma.secao.findUnique({
          where: { id: secaoId },
        });

        if (!secao) {
          return res.status(404).json({ message: "Seção não encontrada" });
        }
      }

      const updatedMaquina = await prisma.maquina.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          funcionando,
          secaoId, // Atualizar a seção associada
        },
      });

      res.status(200).json(updatedMaquina);
    } catch (error) {
      console.error("Erro ao atualizar máquina:", error);
      res.status(500).json({ message: "Erro ao atualizar máquina" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Excluir a máquina
      const deletedMaquina = await prisma.maquina.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json(deletedMaquina); // Resposta com a máquina excluída
    } catch (error) {
      console.error("Erro ao excluir a máquina:", error);
      res.status(500).json({
        message: "Exclua primeiro as intervenções registradas.",
      });
    }
  } else {
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
