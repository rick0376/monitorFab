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

    // Validação reforçada (garante tipos corretos)
    if (!maquinaId || !horaInicio || !motivo) {
      return res
        .status(400)
        .json({ error: "Preencha Equipamento, Hora de Início e Motivo!" });
    }

    try {
      // Converter horaInicio para Date mesmo se horaFinalizacao não existir
      const horaInicioDate = new Date(horaInicio);
      if (isNaN(horaInicioDate.getTime())) {
        return res
          .status(400)
          .json({ error: "Formato de Hora de Início inválido" });
      }

      // Cálculo do tempoIntervencao (mesmo se horaFinalizacao for null)
      let tempoIntervencao = 0; // Valor padrão 0 (nunca null)
      if (horaInicio) {
        const start = new Date(horaInicio).getTime();
        const end = horaFinalizacao
          ? new Date(horaFinalizacao).getTime()
          : Date.now(); // Usa hora atual se não houver finalização
        tempoIntervencao = Math.floor((end - start) / 1000);
      }

      // Criar parada com dados validados
      const parada = await prisma.parada.create({
        data: {
          maquina: {
            connect: { id: parseInt(maquinaId) }, // Vincule explicitamente à máquina
          },
          horaInicio: horaInicioDate,
          motivo: motivo.trim(),
          equipeAtuando: equipeAtuando?.trim() || "",
          horaFinalizacao: horaFinalizacao ? new Date(horaFinalizacao) : null,
          observacao: observacao?.trim() || "",
          tempoIntervencao,
          funcionando: !!horaFinalizacao,
        },
      });

      // Atualizar máquina (usar transação para atomicidade)
      await prisma.$transaction([
        prisma.maquina.update({
          where: { id: parseInt(maquinaId) },
          data: { funcionando: !!horaFinalizacao },
        }),
      ]);

      return res.status(200).json(parada);
    } catch (error) {
      console.error("Erro detalhado:", error); // Log para diagnóstico
      return res.status(500).json({
        error: "Erro ao criar parada",
        details: error.message, // Informação útil para debug
      });
    }
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const {
      motivo,
      horaInicio,
      horaFinalizacao,
      observacao,
      funcionando,
      maquinaId,
      tempoIntervencao, // ← Campo que estava faltando
    } = req.body;

    try {
      const paradaAtualizada = await prisma.parada.update({
        where: { id: parseInt(id) },
        data: {
          motivo,
          horaInicio: new Date(horaInicio),
          horaFinalizacao: horaFinalizacao ? new Date(horaFinalizacao) : null,
          observacao,
          funcionando,
          maquinaId: parseInt(maquinaId),
          tempoIntervencao: parseInt(tempoIntervencao), // ← Aqui você inclui o campo
        },
      });

      // Atualiza status da máquina
      await prisma.maquina.update({
        where: { id: parseInt(maquinaId) },
        data: { funcionando },
      });

      return res.status(200).json(paradaAtualizada);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar parada" });
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
          maquina: {
            // Incluir dados da máquina, como o nome
            select: { nome: true },
          },
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
