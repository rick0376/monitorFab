// pages/api/paradas/abertas.js

import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { maquinaId } = req.query;

    if (!maquinaId) {
      return res.status(400).json({ error: "Máquina não especificada" });
    }

    try {
      const paradaAberta = await prisma.parada.findFirst({
        where: {
          maquinaId: parseInt(maquinaId),
          horaFinalizacao: null, // Verifica se não existe hora de finalização
        },
      });

      if (paradaAberta) {
        return res.status(200).json({ existeParadaAberta: true });
      } else {
        return res.status(200).json({ existeParadaAberta: false });
      }
    } catch (error) {
      console.error("Erro ao verificar parada aberta:", error);
      return res
        .status(500)
        .json({ error: "Erro ao acessar o banco de dados" });
    }
  } else {
    return res
      .status(405)
      .json({ message: `Método ${req.method} não permitido` });
  }
}
