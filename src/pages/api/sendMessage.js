import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import fs from "fs";
import path from "path";

// Inicializa o cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
});

let isClientReady = false;
let qrCodeData = "";

// Evento para gerar QR Code
client.on("qr", (qr) => {
  qrcode.toDataURL(qr, (err, url) => {
    if (!err) qrCodeData = url;
  });
});

// Evento de pronto
client.on("ready", () => {
  isClientReady = true;
});

client.initialize();

// Função para formatar número
function formatNumber(number) {
  let num = number.replace(/\D/g, "");
  if (!num.startsWith("55")) num = "55" + num;
  return `${num}@c.us`;
}

// Handler da API
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { numeros, mensagem } = req.body;

    if (!Array.isArray(numeros) || numeros.length === 0) {
      return res
        .status(400)
        .json({ error: "A lista de números não pode estar vazia." });
    }
    if (!mensagem || mensagem.trim() === "") {
      return res
        .status(400)
        .json({ error: "A mensagem não pode estar vazia." });
    }
    if (!isClientReady) {
      return res
        .status(503)
        .json({ error: "WhatsApp não está pronto. Escaneie o QR Code." });
    }

    // Envia a mensagem para cada número formatado
    try {
      const results = await Promise.allSettled(
        numeros.map((numero) => {
          const chatId = formatNumber(numero);
          return client.sendMessage(chatId, mensagem);
        })
      );

      const failed = results
        .map((result, idx) =>
          result.status === "rejected" ? numeros[idx] : null
        )
        .filter(Boolean);

      return res.status(200).json({
        success: `Mensagens enviadas para ${
          numeros.length - failed.length
        } números.`,
        failed,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao enviar as mensagens.",
        details: error.message,
      });
    }
  } else if (req.method === "GET") {
    if (!qrCodeData) {
      return res
        .status(400)
        .json({
          error: "QR Code ainda não foi gerado. Aguarde a inicialização.",
        });
    }
    return res.status(200).json({ qrCode: qrCodeData });
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
