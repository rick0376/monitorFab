import { useState, useEffect } from "react";
import Modal from "react-modal";
import Link from "next/link";
import logoImg from "/public/logo.png";
import Image from "next/image";
import styles from "./styles.module.scss";

Modal.setAppElement("#__next");

export default function Dashboard() {
  const [maquinas, setMaquinas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    const fetchMaquinas = async () => {
      const res = await fetch("/api/maquinas");
      const data = await res.json();
      console.log("Máquinas:", data);

      const maquinasOrdenadas = data.sort((a, b) => a.id - b.id);
      setMaquinas(maquinasOrdenadas);
    };
    fetchMaquinas();
  }, []);

  const openModal = (maquina) => {
    setSelectedMachine(maquina);
    setIsModalOpen(true);
  };

  const handleEditParada = (paradaId) => {
    window.location.href = `/painel/updateParadas/editParada?id=${paradaId}`;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  return (
    <div className={styles.body}>
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
            <div>
              <h1 className={styles.h1Header}>Relatório de Intervenção</h1>
            </div>
          </div>
          <div className={styles.menuLink}>
            <Link href="/" className={styles.menuItem}>
              Home
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        <div className={styles.machineList}>
          {maquinas.map((maquina) => (
            <div
              key={maquina.id}
              className={`${styles.machineItem} ${
                maquina.funcionando ? styles.green : styles.red
              }`}
              onClick={() => openModal(maquina)} // Abre a modal ao clicar na máquina
            >
              <p>{maquina.nome}</p>
              <p>
                Status: {maquina.funcionando ? "Funcionando" : "Em Manutenção"}
              </p>
            </div>
          ))}
        </div>

        {/* Modal para exibir o histórico de paradas */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Histórico de Paradas"
          className={`${styles.modal} ${styles.modalContent}`}
          overlayClassName={styles.overlay}
        >
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              Paradas - {selectedMachine?.nome}
            </h2>
            <button className={styles.closeButton} onClick={closeModal}>
              &times;
            </button>
          </div>
          <div className={styles.modalBody}>
            {selectedMachine?.paradas && selectedMachine.paradas.length > 0 ? (
              <ul>
                {selectedMachine.paradas.map((parada, index) => (
                  <li key={index} className={styles.paradaItem}>
                    <p>
                      <strong>Motivo:</strong> {parada.motivo}
                    </p>
                    <p>
                      <strong>Hora de Início:</strong> {parada.horaInicio}
                    </p>
                    <p>
                      <strong>Hora de Finalização:</strong>{" "}
                      {parada.horaFinalizacao || "Ainda em andamento"}
                    </p>
                    <p>
                      <strong>Observação:</strong> {parada.observacao}
                    </p>
                    <button
                      onClick={() => handleEditParada(parada.id)}
                      className={styles.buttonSearch}
                    >
                      Editar Parada
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Não há paradas registradas para esta máquina.</p>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
