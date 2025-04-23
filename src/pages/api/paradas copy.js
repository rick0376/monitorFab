import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      maquinaId,
      horaInicio,
      motivo,
      equipeAtuando,
      horaFinalizacao,
      observacao,
    } = req.body;

    try {
      // Cria uma nova parada
      const parada = await prisma.parada.create({
        data: {
          maquinaId: parseInt(maquinaId),
          horaInicio: new Date(horaInicio),
          motivo,
          equipeAtuando,
          horaFinalizacao: horaFinalizacao ? new Date(horaFinalizacao) : null,
          observacao,
        },
      });

      // Atualiza o status de funcionamento da máquina
      const maquinaAtualizada = await prisma.maquina.update({
        where: { id: parseInt(maquinaId) },
        data: {
          funcionando: horaFinalizacao ? true : false, // Se horaFinalizacao for preenchido, a máquina é considerada funcionando
        },
      });

      return res.status(200).json(parada); // Retorna a parada criada
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar a parada." });
    }
  }

  if (req.method === "GET") {
    try {
      const { dataInicio, dataFinalizacao, status } = req.query;

      let queryConditions = {};

      // Filtro por data de início
      if (dataInicio) {
        queryConditions.horaInicio = { gte: new Date(dataInicio) }; // Maior ou igual a dataInicio
      }

      // Filtro por data de finalização
      if (dataFinalizacao) {
        queryConditions.horaFinalizacao = { lte: new Date(dataFinalizacao) }; // Menor ou igual a dataFinalizacao
      }

      // Filtro por status (aberto ou finalizado)
      if (status) {
        if (status === "aberto") {
          queryConditions.horaFinalizacao = null; // Paradas abertas não têm hora de finalização
        } else if (status === "finalizado") {
          queryConditions.horaFinalizacao = { not: null }; // Paradas com horaFinalizacao não nula são finalizadas
        }
      }

      const paradas = await prisma.parada.findMany({
        where: queryConditions,
        include: {
          maquina: true, // Incluir dados da máquina (opcional)
        },
      });

      return res.status(200).json(paradas); // Retorna as paradas com base nos filtros
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar paradas" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    try {
      await prisma.parada.delete({
        where: { id: parseInt(id) },
      });
      return res.status(200).json({ message: "Parada excluída com sucesso." });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao excluir a parada." });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: "Método não permitido" });
}
