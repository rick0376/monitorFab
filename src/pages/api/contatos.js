import { prisma } from "../../lib/prisma"; // Importando a conexão do Prisma

export default async function handler(req, res) {
  // Método POST para adicionar um novo contato
  if (req.method === "POST") {
    const { nome, celular } = req.body;

    try {
      const novoContato = await prisma.contato.create({
        data: {
          nome,
          celular,
        },
      });
      res.status(201).json({ contato: novoContato });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar o contato." });
    }

    // Método GET para listar os contatos cadastrados
  } else if (req.method === "GET") {
    try {
      const contatos = await prisma.contato.findMany();
      res.status(200).json({ contatos });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar contatos." });
    }

    // Método DELETE para excluir um contato
  } else if (req.method === "DELETE") {
    const { id } = req.query;

    try {
      await prisma.contato.delete({
        where: { id: parseInt(id) },
      });
      res.status(200).json({ message: "Contato excluído com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir o contato." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
