import React, { useState, useEffect } from "react";
import Head from "next/head";
import Modal from "react-modal";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import {
  format,
  parseISO,
  isWithinInterval,
  isSameDay,
  startOfDay,
} from "date-fns";
import { FaHome } from "react-icons/fa";
import logoImg from "/public/logo.png";
import styles from "./styles.module.scss";

Modal.setAppElement("#__next");

const hoje = new Date();
const ontem = new Date(hoje);
ontem.setDate(ontem.getDate() - 1);
const formattedHoje = hoje.toISOString().split("T")[0];
const formattedOntem = ontem.toISOString().split("T")[0];

export default function MachineOverview() {
  const router = useRouter();

  const [maquinas, setMaquinas] = useState([]);
  const [machineTimers, setMachineTimers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const [startDate, setStartDate] = useState(formattedOntem);
  const [startTime, setStartTime] = useState("00:01");
  const [endDate, setEndDate] = useState(formattedHoje);
  const [endTime, setEndTime] = useState("23:59");

  const [refreshInterval, setRefreshInterval] = useState(300000);
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMachineTimers((prev) => {
        const next = { ...prev };
        maquinas.forEach((m) => {
          const ativo = m.paradas?.find((p) => !p.horaFinalizacao);
          if (ativo) {
            const elapsed = Math.floor(
              (Date.now() - new Date(ativo.horaInicio).getTime()) / 1000
            );
            next[m.id] = elapsed;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [maquinas]);

  const fetchMaquinas = async () => {
    const res = await fetch("/api/maquinas");
    const data = await res.json();
    setMaquinas(data.sort((a, b) => a.id - b.id));
  };

  useEffect(() => {
    fetchMaquinas();
    const timer = setInterval(fetchMaquinas, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const openModal = (maquina) => {
    setSelectedMachine(maquina);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  const buildStart = () =>
    startDate && startTime ? new Date(`${startDate}T${startTime}`) : null;
  const buildEnd = () =>
    endDate && endTime ? new Date(`${endDate}T${endTime}`) : null;

  const filterByDate = () => {
    if (!selectedMachine) return [];
    const start = buildStart();
    const end = buildEnd();
    return selectedMachine.paradas.filter((p) => {
      const d = new Date(p.horaInicio);
      return start && end ? d >= start && d <= end : true;
    });
  };

  const getFilteredParadas = () => {
    const list = filterByDate();
    if (statusFiltro === "abertos") {
      return list.filter((p) => !p.horaFinalizacao);
    }
    if (statusFiltro === "finalizados") {
      return list.filter((p) => p.horaFinalizacao);
    }
    return list;
  };

  const formatDateForDisplay = (iso) =>
    format(parseISO(iso), "dd/MM/yyyy HH:mm");

  function formatTimeHM(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  }

  const handleEditParada = (id) => {
    router.push({
      pathname: "/painel/manutencao/updateintervencao",
      query: { id, returnUrl: "/painel/controlmaquina/geral" },
    });
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Machine Control Panel</title>
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
            <h1 className={styles.h1Header}>Machine Control</h1>
          </div>

          <div className={styles.divAtualiza}>
            <label>
              Atualizar
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                style={{ marginLeft: 8 }}
              >
                <option value={60000}>1 minuto</option>
                <option value={120000}>2 minutos</option>
                <option value={180000}>3 minutos</option>
                <option value={300000}>5 minutos</option>
                <option value={600000}>10 minutos</option>
              </select>
            </label>
          </div>
          <div className={styles.menuLink}>
            <Link href="/" className={styles.menuItem}>
              <FaHome className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        <div className={styles.machineList}>
          {maquinas.map((m) => {
            const ativo = m.paradas?.find((p) => !p.horaFinalizacao);
            return (
              <div
                key={m.id}
                className={`${styles.machineItem} ${
                  m.funcionando ? styles.green : styles.red
                }`}
                onClick={() => openModal(m)}
              >
                <p>{m.nome}</p>
                <p>Status: {m.funcionando ? "Funcionando" : "Em Manutenção"}</p>
                {ativo && (
                  <p>
                    Tempo de Intervenção: {formatTime(machineTimers[m.id] || 0)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal para exibir o histórico de paradas */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className={styles.modalContent}
          overlayClassName={styles.overlay}
        >
          <div className={styles.modalHeader}>
            <h2>Intervenção - {selectedMachine?.nome}</h2>
            <button className={styles.closeButton} onClick={closeModal}>
              &times;
            </button>
          </div>
          <div className={styles.modalBody}>
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
                  Fim :
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

              <div className={styles.statusFilter}>
                <label className={styles.labelStatus}>
                  Status:
                  <select
                    className={styles.selectStatus}
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="abertos">Abertos</option>
                    <option value="finalizados">Finalizados</option>
                  </select>
                </label>
              </div>
            </div>

            <ul className={styles.paradaList}>
              {getFilteredParadas().length > 0 ? (
                getFilteredParadas().map((p) => (
                  <li key={p.id} className={styles.paradaItem}>
                    <div className={styles.divList}>
                      <p>
                        <strong>Motivo:</strong> {p.motivo}
                      </p>
                      <p>
                        <strong>Início:</strong>{" "}
                        {formatDateForDisplay(p.horaInicio)}
                      </p>
                      <p>
                        <strong>Fim:</strong>{" "}
                        {p.horaFinalizacao
                          ? formatDateForDisplay(p.horaFinalizacao)
                          : "Em andamento"}
                      </p>

                      {/* INÍCIO DO INCREMENTO */}
                      {p.horaFinalizacao && (
                        <p>
                          <strong>Tempo parado:</strong>{" "}
                          {formatTimeHM(
                            Math.floor(
                              (new Date(p.horaFinalizacao).getTime() -
                                new Date(p.horaInicio).getTime()) /
                                1000
                            )
                          )}
                        </p>
                      )}
                      {/* FIM DO INCREMENTO */}

                      <div className={styles.observacaoWrapper}>
                        <strong>Obs.:</strong>
                        <div className={styles.observacaoText}>
                          {p.observacao}
                        </div>
                      </div>
                    </div>
                    <div className={styles.buttonList}>
                      <button
                        className={styles.buttonSearch}
                        onClick={() => handleEditParada(p.id)}
                      >
                        Editar Intervenção
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p>Nenhuma parada encontrada.</p>
              )}
            </ul>
          </div>
        </Modal>
      </div>
    </div>
  );
}
