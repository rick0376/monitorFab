import { prisma } from "../../../lib/prisma"; // Certifique-se de que o caminho está correto

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const parada = await prisma.parada.findUnique({
        where: { id: parseInt(id) },
        include: {
          maquina: true, // Incluir os dados da máquina ao buscar a parada
        },
      });
      res.status(200).json(parada);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar parada" });
    }
  } else if (req.method === "PUT") {
    try {
      const {
        motivo,
        horaInicio,
        horaFinalizacao,
        observacao,
        funcionando,
        tempoIntervencao, // ← Campo adicionado
        maquinaId,
      } = req.body;

      // Modifique o método PUT para incluir todos os campos:
      const updatedParada = await prisma.parada.update({
        where: { id: parseInt(id) },
        data: {
          motivo,
          horaInicio: new Date(horaInicio), // Converta para Date
          horaFinalizacao: horaFinalizacao ? new Date(horaFinalizacao) : null,
          observacao,
          funcionando,
          maquinaId: parseInt(maquinaId), // Adicione esta linha
          tempoIntervencao: parseInt(tempoIntervencao), // Adicione esta linha
        },
      });

      // Se o estado 'funcionando' foi alterado, também atualize a máquina
      if (funcionando !== undefined) {
        await prisma.maquina.update({
          where: { id: updatedParada.maquinaId },
          data: {
            funcionando: funcionando,
          },
        });
      }

      res.status(200).json(updatedParada);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar parada" });
    }
  } else if (req.method === "DELETE") {
    try {
      const deletedParada = await prisma.parada.delete({
        where: { id: parseInt(id) },
      });
      res.status(200).json(deletedParada); // Retorna a parada deletada
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir parada" });
    }
  } else {
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
