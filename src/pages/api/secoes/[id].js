import { prisma } from "../../../lib/prisma"; // Certifique-se de que o caminho do prisma está correto

export default async function handler(req, res) {
  const { id } = req.query; // Obtém o id da seção da URL

  if (req.method === "GET") {
    try {
      const secao = await prisma.secao.findUnique({
        where: { id: parseInt(id) },
      });
      if (!secao) {
        return res.status(404).json({ message: "Seção não encontrada" });
      }
      res.status(200).json(secao);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar seção" });
    }
  } else if (req.method === "PUT") {
    try {
      const { nome } = req.body;

      const updatedSecao = await prisma.secao.update({
        where: { id: parseInt(id) },
        data: { nome },
      });

      res.status(200).json(updatedSecao);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar seção" });
    }
  } else if (req.method === "DELETE") {
    try {
      // Verificar se há máquinas associadas a esta seção
      const maquinasAssociadas = await prisma.maquina.findMany({
        where: { secaoId: parseInt(id) },
      });

      if (maquinasAssociadas.length > 0) {
        return res.status(400).json({
          message:
            "Não é possível excluir a seção pois existem máquinas associadas a ela",
        });
      }

      const deletedSecao = await prisma.secao.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        message: "Seção excluída com sucesso",
        deletedSecao,
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir a seção" });
    }
  } else {
    // Método HTTP não permitido
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
