import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import logoImg from "/public/logo.png";
import styles from "./styles.module.scss";
import { FaArrowLeft } from "react-icons/fa";

// Modal de confirmação reutilizável
const ConfirmationModal = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Sim",
  cancelText = "Não",
  loading = false,
}) => {
  if (!show) return null;
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtons}>
          <button
            className={styles.modalButtonAtualizar}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processando..." : confirmText}
          </button>
          <button
            className={styles.modalButtonExcluir}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditParada = () => {
  const router = useRouter();
  const { id, returnUrl } = router.query;

  const [parada, setParada] = useState({
    motivo: "",
    horaInicio: "",
    horaFinalizacao: "",
    observacao: "",
    funcionando: true,
  });
  const [maquinaId, setMaquinaId] = useState("");
  const [maquinas, setMaquinas] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timer, setTimer] = useState(0);

  // Estados para modais
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingUpdateEvent, setPendingUpdateEvent] = useState(null);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const fetchMaquinas = async () => {
      const res = await fetch("/api/maquinas");
      const data = await res.json();
      setMaquinas(data);
    };

    fetchMaquinas();

    if (id) {
      const fetchParada = async () => {
        const res = await fetch(`/api/paradas/${id}`);
        const data = await res.json();

        if (data) {
          setParada({
            motivo: data.motivo || "",
            horaInicio: formatDateToLocal(data.horaInicio) || "",
            horaFinalizacao: formatDateToLocal(data.horaFinalizacao) || "",
            observacao: data.observacao || "",
            funcionando: data.maquina ? data.maquina.funcionando : true,
          });
          setMaquinaId(data.maquina ? data.maquina.id : "");
        }
      };
      fetchParada();
    }
  }, [id]);

  const formatDateToLocal = (date) => {
    if (!date) return "";
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateToDatabase = (date) => {
    if (!date) return null;
    const localDate = new Date(date);
    return localDate.toISOString();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParada({
      ...parada,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "horaFinalizacao" && value) {
      const startTime = new Date(parada.horaInicio).getTime();
      const endTime = new Date(value).getTime();
      const totalTime = Math.floor((endTime - startTime) / 1000);
      setTimer(totalTime);
    }
  };

  const handleSelectMachine = (e) => {
    setMaquinaId(e.target.value);
  };

  // Atualização: abre modal de confirmação
  const handleUpdateClick = (e) => {
    e.preventDefault();
    setPendingUpdateEvent(e);
    setShowUpdateModal(true);
  };

  // Confirmação de atualização
  const handleUpdate = async () => {
    setIsProcessing(true);
    const e = pendingUpdateEvent;
    setPendingUpdateEvent(null);

    const startTime = new Date(parada.horaInicio).getTime();
    const endTime = parada.horaFinalizacao
      ? new Date(parada.horaFinalizacao).getTime()
      : Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);

    const updatedParada = {
      ...parada,
      horaInicio: formatDateToDatabase(parada.horaInicio),
      horaFinalizacao: formatDateToDatabase(parada.horaFinalizacao),
      funcionando: !!parada.horaFinalizacao,
      maquinaId: maquinaId,
      tempoIntervencao: totalTime,
    };

    const res = await fetch(`/api/paradas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedParada),
    });

    if (res.ok) {
      setSuccessMessage("Intervenção atualizada com sucesso!");
      setErrorMessage("");
      router.push(returnUrl || "/");
    } else {
      const result = await res.json();
      setErrorMessage(result.message || "Erro ao atualizar a Intervenção");
      setSuccessMessage("");
    }
    setIsProcessing(false);
    setShowUpdateModal(false);
  };

  // Exclusão: abre modal de confirmação
  const handleDeleteClick = () => setShowDeleteModal(true);

  // Confirmação de exclusão
  const handleDelete = async () => {
    setIsProcessing(true);
    const res = await fetch(`/api/paradas/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      setSuccessMessage("Intervenção excluída com sucesso");
      router.push(returnUrl || "/");
    } else {
      const result = await res.json();
      setErrorMessage(result.message || "Erro ao excluir a Intervenção");
    }
    setIsProcessing(false);
    setShowDeleteModal(false);
  };

  return (
    <div className={styles.body}>
      <div className={styles.divHeader}>
        <header className={styles.header}>
          <div className={styles.divimg}>
            <Link href={returnUrl || "/"}>
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
            <h1 className={styles.h1Header}>Editar Intervenções</h1>
          </div>
          <div className={styles.menuLink}>
            <Link href={returnUrl || "/"} className={styles.menuItem}>
              <FaArrowLeft className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        <h1 className={styles.h1Container}>Editar Intervenções</h1>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form className={styles.form} onSubmit={handleUpdateClick}>
          <label htmlFor="equipment" className={styles.label}>
            Equipamento:
          </label>
          <select
            id="equipment"
            className={styles.select}
            value={maquinaId}
            onChange={handleSelectMachine}
          >
            <option value="">Selecione uma Máquina</option>
            {maquinas.map((maquina) => (
              <option key={maquina.id} value={maquina.id}>
                {maquina.nome}
              </option>
            ))}
          </select>

          <label htmlFor="horaInicio" className={styles.label}>
            Hora de Início:
          </label>
          <input
            type="datetime-local"
            id="horaInicio"
            name="horaInicio"
            value={parada.horaInicio}
            onChange={handleChange}
          />

          <label htmlFor="motivo" className={styles.label}>
            Motivo da Parada:
          </label>
          <textarea
            className={styles.inputArea}
            type="text"
            id="motivo"
            name="motivo"
            value={parada.motivo}
            onChange={handleChange}
            placeholder="Motivo da parada"
            maxLength={"500"}
          />

          <label htmlFor="horaFinalizacao" className={styles.label}>
            Hora de Finalização:
          </label>
          <input
            type="datetime-local"
            id="horaFinalizacao"
            name="horaFinalizacao"
            value={parada.horaFinalizacao}
            onChange={handleChange}
          />

          <label htmlFor="observacao" className={styles.label}>
            Observações:
          </label>
          <textarea
            className={styles.inputArea}
            placeholder="Observações adicionais"
            maxLength={"500"}
            id="observacao"
            name="observacao"
            value={parada.observacao}
            onChange={handleChange}
          ></textarea>

          <div className={styles.inputCheck}>
            <input
              type="checkbox"
              id="funcionando"
              checked={parada.funcionando}
              onChange={(e) =>
                setParada({ ...parada, funcionando: e.target.checked })
              }
            />
            <label>Máquina Funcionando</label>
          </div>

          <div className={styles.inputCheck}>
            {parada.horaFinalizacao && (
              <p>Tempo de Intervenção: {formatTime(timer)}</p>
            )}
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>
              Atualizar
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDeleteClick}
            >
              Excluir
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmação de atualização */}
      <ConfirmationModal
        show={showUpdateModal}
        title="Confirmação de Atualização"
        message="Deseja atualizar esta parada?"
        onConfirm={handleUpdate}
        onCancel={() => setShowUpdateModal(false)}
        confirmText="Atualizar"
        cancelText="Cancelar"
        loading={isProcessing}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        show={showDeleteModal}
        title="Confirmação de Exclusão"
        message="Deseja excluir esta Intervenção?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={isProcessing}
      />
    </div>
  );
};

export default EditParada;
