import { prisma } from "../../lib/prisma"; // Importando a conexão Prisma

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { startDate, endDate } = req.body; // Recebe as datas do corpo da requisição

    try {
      // Consulta no banco de dados usando o Prisma, filtrando pela data de início
      const paradas = await prisma.parada.findMany({
        where: {
          horaInicio: {
            gte: new Date(startDate), // Maior ou igual a data de início
            lte: new Date(endDate), // Menor ou igual a data de término
          },
        },
        include: {
          maquina: true, // Inclui os dados da máquina na consulta
        },
      });

      // Retorna as paradas encontradas
      res.status(200).json({ paradas });
    } catch (error) {
      console.error("Erro ao buscar as paradas:", error);
      res
        .status(500)
        .json({ error: "Erro ao buscar as paradas no banco de dados." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido" }); // Se não for POST, retorna erro
  }
}
