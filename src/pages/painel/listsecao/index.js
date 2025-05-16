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

const SecaoList = () => {
  const [secoes, setSecoes] = useState([]);
  const [selectedSecao, setSelectedSecao] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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
    const fetchSecoes = async () => {
      const res = await fetch("/api/secoes");
      const data = await res.json();

      const secoesOrdenadas = data.sort((a, b) => a.nome.localeCompare(b.nome));
      setSecoes(secoesOrdenadas);
    };
    fetchSecoes();
  }, []);

  const handleSelectSecao = (secao) => {
    setSelectedSecao(secao);
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
    if (!selectedSecao) return;

    showConfirmModal(
      "Confirmação",
      <>
        Tem certeza que deseja excluir a seção{" "}
        <span className={styles.modalMachineName}>{selectedSecao.nome}</span>?
      </>,
      async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        setIsDeleting(true);
        try {
          const res = await fetch(`/api/secoes/${selectedSecao.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setSelectedSecao(null);
            showInfoModal("Sucesso", "Seção excluída com sucesso.");
            const updatedSecoes = secoes.filter(
              (secao) => secao.id !== selectedSecao.id
            );
            setSecoes(updatedSecoes);
          } else {
            const errorData = await res.json();
            showInfoModal(
              "Erro",
              errorData.message ||
                "Erro ao excluir a seção! Verifique se há máquinas associadas a esta seção."
            );
          }
        } catch (error) {
          showInfoModal("Erro", "Erro ao excluir a seção!");
          console.error(error);
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  const handleEdit = () => {
    if (selectedSecao) {
      router.push(`/painel/updatesecao?id=${selectedSecao.id}`);
    }
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Section List</title>
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
            <div>
              <h1 className={styles.h1Header}>Section List</h1>
            </div>
          </div>
          <div className={styles.menuLink}>
            <Link href="/painel/cadastrar/secoes" className={styles.menuItem}>
              <FaPlus className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>
      <div className={styles.machineListContainer}>
        <h2 className={styles.header}>Seções Registradas</h2>
        <div className={styles.machineList}>
          {[...secoes]
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((secao) => (
              <div
                key={secao.id}
                className={styles.machineItem}
                onClick={() => handleSelectSecao(secao)}
              >
                <p className={styles.machineName}>{secao.nome}</p>
              </div>
            ))}
        </div>

        {selectedSecao && (
          <div className={styles.editMachineContainer}>
            <h3 className={styles.editHeader}>
              Editando: {selectedSecao.nome}
            </h3>
            <div className={styles.buttonContainer}>
              <button onClick={handleEdit} className={styles.submitButton}>
                Editar Seção
              </button>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir Seção"}
              </button>
            </div>
          </div>
        )}

        {/* Modal de confirmação/erro */}
        <Modal {...modal} />
      </div>
    </div>
  );
};

export default SecaoList;
