import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import logoImg from "/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";
import { FaPlus } from "react-icons/fa";

const Modal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancelar",
}) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        {title && <h3 className={styles.modalTitle}>{title}</h3>}
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtonRow}>
          {onCancel && (
            <button onClick={onCancel} className={styles.modalButtonCancel}>
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button onClick={onConfirm} className={styles.modalButtonConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MachineList = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "OK",
    cancelText: "Cancelar",
  });

  useEffect(() => {
    const fetchMaquinas = async () => {
      const res = await fetch("/api/maquinas");
      const data = await res.json();
      const maquinasOrdenadas = data.sort((a, b) => a.id - b.id);
      setMaquinas(maquinasOrdenadas);
    };
    fetchMaquinas();
  }, []);

  const handleSelectMachine = (maquina) => {
    setSelectedMachine(maquina);
  };

  const showConfirmModal = (title, message, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel: () => setModal((m) => ({ ...m, isOpen: false })),
      confirmText: "Sim",
      cancelText: "Não",
    });
  };

  const showInfoModal = (title, message) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
      onCancel: null,
      confirmText: "OK",
      cancelText: "",
    });
  };

  const handleDelete = async () => {
    if (!selectedMachine) return;

    showConfirmModal(
      "Confirmação",
      <>
        Tem certeza que deseja excluir a máquina{" "}
        <span className={styles.modalMachineName}>{selectedMachine.nome}</span>?
      </>,
      async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/maquinas/${selectedMachine.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setSelectedMachine(null);
            showInfoModal("Sucesso", "Máquina excluída com sucesso.");
            const updatedMaquinas = maquinas.filter(
              (maquina) => maquina.id !== selectedMachine.id
            );
            setMaquinas(updatedMaquinas);
          } else {
            const errorData = await res.json();
            showInfoModal(
              "Erro",
              `Erro ao excluir a máquina! ${errorData.message}`
            );
          }
        } catch (error) {
          showInfoModal("Erro", "Erro ao excluir a máquina!");
          console.error(error);
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  const handleEdit = () => {
    if (selectedMachine) {
      router.push(`/painel/updatemaquina?id=${selectedMachine.id}`);
    }
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Machine List</title>
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
            <h1 className={styles.h1Header}>Machine List</h1>
          </div>
          <div className={styles.menuLink}>
            <Link href="/painel/cadastrar/maquinas" className={styles.menuItem}>
              <FaPlus className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.machineListContainer}>
        <h2 className={styles.header}>Editar / Excluir Máquinas</h2>
        <div className={styles.machineList}>
          {[...maquinas]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((maquina) => (
              <div
                key={maquina.id}
                className={styles.machineItem}
                onClick={() => handleSelectMachine(maquina)}
              >
                <p className={styles.machineName}>{maquina.nome}</p>
              </div>
            ))}
        </div>

        {selectedMachine && (
          <div className={styles.editMachineContainer}>
            <h3 className={styles.editHeader}>
              Editando: {selectedMachine.nome}
            </h3>
            <div className={styles.buttonContainer}>
              <button onClick={handleEdit} className={styles.submitButton}>
                Editar Máquina
              </button>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir Máquina"}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modal de confirmação/erro */}
      <Modal {...modal} />
    </div>
  );
};

export default MachineList;
