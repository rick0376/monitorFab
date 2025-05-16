import { useState, useEffect } from "react";
import { format } from "date-fns";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Modal from "react-modal";
import logoImg from "/public/logo.png";
import { FaHome, FaTrash, FaPlus, FaWhatsapp } from "react-icons/fa";
import styles from "./styles.module.scss";

Modal.setAppElement("#__next");

const hoje = new Date();
const ontem = new Date(hoje);
ontem.setDate(ontem.getDate() - 1);
const formattedHoje = hoje.toISOString().split("T")[0];
const formattedOntem = ontem.toISOString().split("T")[0];

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDateForDisplay = (iso) => format(parseISO(iso), "dd/MM/yyyy HH:mm");

function formatTimeHM(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

const fetchParadasByDate = async (startDate, endDate) => {
  try {
    const res = await fetch("/api/paradaas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate }),
    });

    const data = await res.json();

    if (res.ok) {
      return data.paradas;
    } else {
      console.error("Erro ao buscar as paradas:", data);
      return [];
    }
  } catch (error) {
    console.error("Erro ao buscar paradas:", error);
    return [];
  }
};

const fetchContatos = async () => {
  try {
    const res = await fetch("/api/contatos");
    const data = await res.json();
    if (res.ok) {
      return data.contatos;
    } else {
      console.error("Erro ao buscar contatos:", data);
      return [];
    }
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    return [];
  }
};

const handleAddContacts = () => {
  const newContactsForSending = selectedContacts.filter(
    (contact) => !contactsForSending.includes(contact)
  );

  const existingContacts = selectedContacts.filter((contact) =>
    contactsForSending.includes(contact)
  );

  if (existingContacts.length > 0) {
    setStatus(
      `O(s) seguinte(s) contato(s) já foram adicionados: ${existingContacts.join(
        ", "
      )}`
    );
    return;
  }

  setContactsForSending([...contactsForSending, ...newContactsForSending]);

  setSelectedContacts([]);
};

const handleCheckboxChange = (e, contatoCelular) => {
  const updatedSelection = e.target.checked
    ? [...selectedContacts, contatoCelular]
    : selectedContacts.filter((id) => id !== contatoCelular);
  setSelectedContacts(updatedSelection);
};

const ParadasPage = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(formattedDate);
  const [startTime, setStartTime] = useState("00:01");
  const [endDate, setEndDate] = useState(formattedDate);
  const [endTime, setEndTime] = useState("23:59");
  const [paradas, setParadas] = useState([]);
  const [status, setStatus] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactsForSending, setContactsForSending] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [qrScanned, setQrScanned] = useState(false);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const [isQRCodeGenerated, setIsQRCodeGenerated] = useState(false);

  const handleEditParada = (paradaId) => {
    const returnUrl = `/painel/manutencao/listintervencao`;
    window.location.href = `/painel/manutencao/updateintervencao?id=${paradaId}&returnUrl=${encodeURIComponent(
      returnUrl
    )}`;
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFetchParadas = async () => {
    if (!startDate || !endDate) {
      setStatus("Por favor, selecione as datas.");
      return;
    }

    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    const fetchedParadas = await fetchParadasByDate(startDateTime, endDateTime);

    if (fetchedParadas.length === 0) {
      setStatus("Não há paradas para o período selecionado.");
      setParadas([]);
    } else {
      const sortedParadas = fetchedParadas.sort(
        (a, b) => new Date(a.horaInicio) - new Date(b.horaInicio)
      );
      setParadas(sortedParadas);
      setStatus("");
    }
  };

  const handleStatusChange = (e) => {
    setStatusFiltro(e.target.value);
  };

  const getFilteredParadas = () => {
    if (statusFiltro === "todos") {
      return paradas;
    }
    return paradas.filter((parada) => {
      if (statusFiltro === "abertos") {
        return !parada.horaFinalizacao;
      }
      if (statusFiltro === "finalizados") {
        return parada.horaFinalizacao;
      }
      return true;
    });
  };

  const fetchAndSetContacts = async () => {
    const contatos = await fetchContatos();
    setContacts(contatos);
  };

  const getQrCode = async () => {
    console.log("Iniciando a busca do QR Code...");

    if (contactsForSending.length === 0) {
      setStatus("Por favor, selecione pelo menos um contato.");
      return;
    }

    let qrCodeFetched = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!qrCodeFetched && attempts < maxAttempts) {
      console.log("Tentando buscar o QR Code...");

      try {
        const res = await fetch("/api/sendMessage", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        console.log("Resposta da API:", data);

        if (data.qrCode) {
          setQrCode(data.qrCode);
          setIsQRCodeGenerated(true);
          qrCodeFetched = true;
          console.log("QR Code gerado com sucesso!");
        } else {
          setStatus("Aguarde enquanto o QR Code é gerado...");
          attempts += 1;
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error("Erro ao chamar a API:", error);
        setStatus("Erro ao gerar o QR Code.");
        break;
      }
    }

    if (attempts >= maxAttempts) {
      setStatus("Não foi possível gerar o QR Code após várias tentativas.");
    }
  };

  const formatPhoneNumber = (number) => {
    const cleaned = String(number).replace(/\D/g, "");
    const countryCode = "55";
    return cleaned.startsWith(countryCode)
      ? `+${cleaned}`
      : `+${countryCode}${cleaned}`;
  };

  const sendToWhatsApp = async () => {
    if (contactsForSending.length === 0) {
      setStatus("Por favor, adicione pelo menos um número à lista de envio.");
      return;
    }

    const message = generateMessageForWhatsApp();
    if (!message) return;

    const formattedNumbers = contactsForSending.map(formatPhoneNumber);

    setStatus("Enviando mensagens...");

    try {
      const res = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numeros: formattedNumbers,
          mensagem: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(
          `Erro ao enviar mensagem: ${data.error || "Erro desconhecido"}`
        );
        return;
      }

      setStatus(
        `Mensagens enviadas com sucesso para ${formattedNumbers.length} números!`
      );
      setContactsForSending([]);
    } catch (error) {
      setStatus("Erro ao enviar mensagem para o WhatsApp.");
    }
  };

  const totalSegundosFinalizadas = getFilteredParadas()
    .filter((parada) => parada.horaFinalizacao)
    .reduce((acc, parada) => {
      const inicio = new Date(parada.horaInicio);
      const fim = new Date(parada.horaFinalizacao);
      const diff = (fim - inicio) / 1000;
      return acc + (diff > 0 ? diff : 0);
    }, 0);

  const totalHorasFinalizadas = formatTimeHM(totalSegundosFinalizadas);

  const generateMessageForWhatsApp = () => {
    const filteredParadas = getFilteredParadas();

    if (filteredParadas.length === 0) {
      setStatus("Não há paradas para enviar.");
      return "";
    }

    let message = "*Relatório de Paradas:*\n\n";

    filteredParadas.forEach((parada, index) => {
      message += `*Máquina:* ${parada.maquina.nome}:\n`;
      message += `*Parada ${index + 1}:*\n`;
      message += `*Motivo:* ${parada.motivo}\n`;
      message += `*Hora de Início:* ${format(
        new Date(parada.horaInicio),
        "dd/MM/yyyy HH:mm"
      )}\n\n`;
      message += `*Hora de Finalização:* ${
        parada.horaFinalizacao
          ? format(new Date(parada.horaFinalizacao), "dd/MM/yyyy HH:mm")
          : "Ainda em andamento"
      }\n\n`;

      if (parada.horaFinalizacao) {
        const tempoSegundos =
          (new Date(parada.horaFinalizacao) - new Date(parada.horaInicio)) /
          1000;
        message += `*Tempo da intervenção:* ${formatTimeHM(tempoSegundos)}\n\n`;
      }

      message += `*Observação:* ${parada.observacao}\n\n`;
    });

    return message.trim();
  };

  useEffect(() => {
    handleFetchParadas();
    fetchAndSetContacts();
  }, [startDate, startTime, endDate, endTime]);

  const handleOpenIntervencao = () => {
    const returnUrl = document.referrer || "/painel/manutencao/listintervencao";
    window.location.href = `/painel/manutencao/intervencao?returnUrl=${encodeURIComponent(
      returnUrl
    )}`;
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Lists of Interventions</title>
      </Head>
      <div className={styles.divHeader}>
        <header className={styles.header}>
          <div className={styles.divimg}>
            <Link href="/">
              <Image
                className={styles.img}
                alt="Logo da LHPSYSTEMS"
                src={logoImg}
                priority={true}
                quality={100}
              />
            </Link>
          </div>
          <div className={styles.headerCenter}>
            <h1 className={styles.h1Header}>Lists of Interventions</h1>
          </div>
          <div className={styles.divButtonStatus}>
            <label>Status:</label>
            <select value={statusFiltro} onChange={handleStatusChange}>
              <option value="todos">Todos</option>
              <option value="abertos">Abertos</option>
              <option value="finalizados">Finalizados</option>
            </select>
          </div>
          <div className={styles.menuLink}>
            <Link
              href="#"
              onClick={handleOpenIntervencao}
              className={styles.menuItem}
            >
              <FaPlus className={styles.divpMenu} /> {/* Ícone de "+" */}
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        {/* Seletor de Data e Hora */}
        <div className={styles.divDateStatus}>
          <div className={styles.dateFilter}>
            <label className={styles.labelFilter}>
              Início:
              <input
                className={styles.inputDate}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                className={styles.inputTime}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label className={styles.labelFilter}>
              Fim:
              <input
                className={styles.inputDateFim}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <input
                className={styles.inputTime}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.divButtonEnviar}>
            <button
              onClick={openModal}
              className={styles.buttonSearchWhats}
              style={{
                display: paradas.length === 0 ? "none" : "inline-flex",
                alignItems: "center",
              }}
            >
              <FaWhatsapp className={styles.icon} />
              <span className={styles.buttonText}>whats</span>
            </button>
          </div>
        </div>

        {/* Exibição das paradas filtradas */}
        <div className={styles.paradaList}>
          {getFilteredParadas().length > 0 ? (
            <>
              <ul>
                {getFilteredParadas().map((parada) => (
                  <div className={styles.paradaItem} key={parada.id}>
                    <li>
                      <p>
                        <strong>Máquina:</strong>{" "}
                        {parada.maquina ? parada.maquina.nome : "Desconhecida"}
                      </p>
                      <p>
                        <strong>Motivo:</strong> {parada.motivo}
                      </p>
                      <p>
                        <strong>Hora Início:</strong>{" "}
                        {format(
                          new Date(parada.horaInicio),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                      <p>
                        <strong>Hora Finalização:</strong>{" "}
                        {parada.horaFinalizacao
                          ? format(
                              new Date(parada.horaFinalizacao),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {parada.horaFinalizacao ? "Finalizada" : "Em aberto"}
                      </p>
                      <p>
                        <strong>Tempo da intervenção:</strong>{" "}
                        {parada.horaFinalizacao
                          ? formatTimeHM(
                              (new Date(parada.horaFinalizacao) -
                                new Date(parada.horaInicio)) /
                                1000
                            )
                          : "Em andamento"}
                      </p>
                      <p>
                        <strong>Observação:</strong>{" "}
                        <span className={styles.observacaoText}>
                          {parada.observacao}
                        </span>
                      </p>
                    </li>
                    <div className={styles.divButtonEdit}>
                      <button
                        onClick={() => handleEditParada(parada.id)}
                        className={styles.buttonSearch}
                      >
                        Editar Intervenção
                      </button>
                    </div>
                  </div>
                ))}
              </ul>
            </>
          ) : (
            <p>Não há paradas para o período selecionado.</p>
          )}
        </div>

        {/* Modal para adicionar número de contato */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Adicionar Contato"
          className={`${styles.modal} ${styles.modalContent}`}
          overlayClassName={styles.overlay}
        >
          {/* Lista de Contatos com Checkboxes */}
          <div>
            <h2>Selecionar Contatos</h2>

            {contacts.length > 0 ? (
              <ul>
                {contacts.map((contato) => (
                  <li key={contato.id}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contato.celular)}
                      onChange={(e) => {
                        const updatedSelection = e.target.checked
                          ? [...selectedContacts, contato.celular]
                          : selectedContacts.filter(
                              (id) => id !== contato.celular
                            );
                        setSelectedContacts(updatedSelection);
                      }}
                    />
                    <span>
                      {contato.nome} - {contato.celular}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Não há contatos cadastrados.</p>
            )}
          </div>

          {/* Status */}
          {status && <p>{status}</p>}

          {/* Adicionar os contatos selecionados à nova lista */}
          <button
            className={styles.buttonSearch}
            onClick={() => {
              const existingContacts = selectedContacts.filter((contact) =>
                contactsForSending.includes(contact)
              );

              if (existingContacts.length > 0) {
                setStatus(
                  `O(s) seguinte(s) contato(s) já foram adicionados: ${existingContacts.join(
                    ", "
                  )}`
                );
                return;
              }

              const newContactsForSending = selectedContacts.filter(
                (contact) => !contactsForSending.includes(contact)
              );

              setContactsForSending([
                ...contactsForSending,
                ...newContactsForSending,
              ]);

              setSelectedContacts([]);
            }}
          >
            Adicionar à lista de envio
          </button>

          {/* Exibição dos Contatos Selecionados para Enviar */}
          <div className={styles.contactList}>
            <h2>Contatos Mensagens</h2>
            {contactsForSending.length > 0 ? (
              <ul>
                {contactsForSending.map((contact, index) => (
                  <li key={index} className={styles.contactItem}>
                    <div className={styles.contactDetails}>
                      <p>{contact}</p>
                      <button
                        className={styles.deleteButton}
                        onClick={() =>
                          setContactsForSending(
                            contactsForSending.filter((c) => c !== contact)
                          )
                        }
                      >
                        <FaTrash size={20} color="red" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Não há contatos para enviar.</p>
            )}
          </div>

          {/* Exibição do QR Code */}
          {qrCode && !qrScanned ? (
            <div>
              <p>QR Code para WhatsApp:</p>
              {loadingQrCode ? (
                <p>Gerando QR Code...</p>
              ) : (
                <img
                  src={qrCode}
                  alt="QR Code"
                  onClick={() => setQrScanned(true)}
                />
              )}
            </div>
          ) : (
            qrScanned && <p>{status}</p>
          )}

          {/* Botões para Gerar QRCode e Enviar Mensagens */}
          <div className={styles.divQRCode}>
            {/* Botão Gerar QR Code - visível apenas se o QR Code não foi gerado */}
            {!isQRCodeGenerated && (
              <button className={styles.buttonSearch} onClick={getQrCode}>
                Gerar QR Code
              </button>
            )}

            {/* Botão Enviar Mensagens - visível apenas após o QR Code ser gerado */}
            {isQRCodeGenerated && !qrScanned && (
              <button className={styles.buttonSearch} onClick={sendToWhatsApp}>
                Enviar Mensagens
              </button>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ParadasPage;
