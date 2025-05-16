import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import logoImg from "/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";
import { FaArrowLeft } from "react-icons/fa";

export default function Paradas() {
  const [maquinas, setMaquinas] = useState([]);
  const [maquinaId, setMaquinaId] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [motivo, setMotivo] = useState("");
  const [equipeAtuando, setEquipeAtuando] = useState("");
  const [horaFinalizacao, setHoraFinalizacao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [isMachineWorking, setIsMachineWorking] = useState(false);
  const [existeParadaAberta, setExisteParadaAberta] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();
  const { returnUrl } = router.query;

  useEffect(() => {
    const fetchMaquinas = async () => {
      const res = await fetch("/api/maquinas");
      const data = await res.json();
      setMaquinas(data);
    };
    fetchMaquinas();
  }, []);

  useEffect(() => {
    if (maquinaId) {
      const checkParadaAberta = async () => {
        const res = await fetch(`/api/paradas/abertas?maquinaId=${maquinaId}`);
        const data = await res.json();
        setExisteParadaAberta(data.existeParadaAberta);
        setModalOpen(data.existeParadaAberta);
      };

      checkParadaAberta();
    }
  }, [maquinaId]);

  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maquinaId || !horaInicio || !motivo) {
      setModal({
        open: true,
        message: "Preencha Equipamento, Hora de Início e Motivo!",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/paradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maquinaId,
          horaInicio,
          motivo,
          equipeAtuando: "",
          horaFinalizacao: "",
          observacao: "",
        }),
      });

      if (res.ok) {
        setModal({
          open: true,
          message: "Registro salvo com sucesso!",
          type: "success",
        });
      } else {
        setModal({
          open: true,
          message: "Erro ao salvar o registro.",
          type: "error",
        });
      }
    } catch (err) {
      setModal({
        open: true,
        message: "Erro na comunicação com o servidor.",
        type: "error",
      });
    }
  };

  const handleCloseModal = () => {
    setModal({ ...modal, open: false });
    if (modal.type === "success") {
      router.push(returnUrl || "/");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Intervention Report</title>
        <meta name="description" content="Cadastrar máquinas no sistema" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <h1 className={styles.h1Header}>Relatório de Intervenções</h1>
            </div>
          </div>
          <div className={styles.menuLink}>
            <Link href={returnUrl || "/"} className={styles.menuItem}>
              <FaArrowLeft className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="equipment" className={styles.label}>
            Equipamento:
          </label>
          <select
            id="equipment"
            className={styles.select}
            value={maquinaId}
            onChange={(e) => setMaquinaId(e.target.value)}
          >
            <option value="">Selecione uma Máquina</option>
            {[...maquinas]
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((maquina) => (
                <option key={maquina.id} value={maquina.id}>
                  {maquina.nome}
                </option>
              ))}
          </select>

          {existeParadaAberta && (
            <div className={styles.alertaParadaAberta}>
              <strong>Atenção!</strong> Já existe uma parada em andamento para
              esta máquina.
            </div>
          )}

          <label htmlFor="horaInicio" className={styles.label}>
            Hora de Início:
          </label>
          <input
            type="datetime-local"
            className={styles.input}
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
          />

          <label htmlFor="motivo" className={styles.label}>
            Motivo da Parada:
          </label>
          <textarea
            className={styles.inputArea}
            placeholder="Motivo da parada"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={"500"}
          />

          <label htmlFor="equipeAtuando" className={styles.label}>
            Equipe Atuando:
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Equipe atuando"
            value={equipeAtuando}
            onChange={(e) => setEquipeAtuando(e.target.value)}
          />

          <label htmlFor="horaFinalizacao" className={styles.label}>
            Hora de Finalização:
          </label>
          <input
            type="datetime-local"
            className={styles.input}
            value={horaFinalizacao}
            onChange={(e) => setHoraFinalizacao(e.target.value)}
          />

          <label htmlFor="observacao" className={styles.label}>
            Observações:
          </label>
          <textarea
            className={styles.inputArea}
            placeholder="Observações adicionais"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={"500"}
          ></textarea>

          <div className={styles.inputCheck}>
            <input
              type="checkbox"
              checked={isMachineWorking}
              onChange={() => setIsMachineWorking(!isMachineWorking)}
            />
            <label>Máquina Funcionando</label>
          </div>

          <button type="submit" className={styles.buttonSearch}>
            Registrar
          </button>
        </form>
      </div>

      {modal.open && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {/* Título opcional */}
            <h2>{modal.type === "success" ? "Sucesso!" : "Atenção!"}</h2>

            {/* Mensagem */}
            <p
              className={
                modal.type === "success"
                  ? styles.modalSuccess
                  : styles.modalError
              }
            >
              {modal.message}
            </p>

            {/* Botões */}
            <div className={styles.modalButtons}>
              <button onClick={handleCloseModal} className={styles.modalButton}>
                OK
              </button>
              {/* Exemplo: redirecionar diretamente para o dashboard */}
              {modal.type === "error" && (
                <Link href={returnUrl || "/"} passHref>
                  <button className={styles.modalButton}>Fechar</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de alerta */}
      {modalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Atenção!</h2>
            <p>Já existe uma parada em andamento para esta máquina.</p>
            <div className={styles.modalButtons}>
              <button onClick={closeModal} className={styles.modalButton}>
                OK
              </button>
              <Link href={returnUrl || "/"} passHref>
                <button className={styles.modalButton}>Ir para o painel</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
