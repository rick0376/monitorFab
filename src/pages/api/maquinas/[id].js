import { prisma } from "../../../lib/prisma"; // Certifique-se de que o caminho do prisma está correto

export default async function handler(req, res) {
  const { id } = req.query; // Obtém o id da máquina da URL

  if (req.method === "GET") {
    try {
      const maquina = await prisma.maquina.findUnique({
        where: { id: parseInt(id) }, // Certifica-se de que o ID está sendo convertido corretamente para número
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
      const { nome, funcionando } = req.body;

      const updatedMaquina = await prisma.maquina.update({
        where: { id: parseInt(id) },
        data: { nome, funcionando }, // Atualiza o nome e o estado de funcionamento
      });

      res.status(200).json(updatedMaquina);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar máquina" });
    }
  } else if (req.method === "DELETE") {
    try {
      const deletedMaquina = await prisma.maquina.delete({
        where: { id: parseInt(id) },
      });
      res
        .status(200)
        .json({ message: "Máquina excluída com sucesso", deletedMaquina });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir a máquina" });
    }
  } else {
    // Método HTTP não permitido
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
