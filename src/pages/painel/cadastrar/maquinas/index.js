"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import logoImg from "/public/logo.png";
import styles from "./styles.module.scss";
import { FaArrowLeft } from "react-icons/fa";

// Modal genérica
const Modal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        {title && <h3 className={styles.modalTitle}>{title}</h3>}
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtonRow}>
          <button onClick={onClose} className={styles.modalButtonConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CadastrarMaquina() {
  const [nome, setNome] = useState("");
  const [secaoId, setSecaoId] = useState("");
  const [secoes, setSecoes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [maquinasExistentes, setMaquinasExistentes] = useState([]);

  // Estados das modais
  const [modalExistenteOpen, setModalExistenteOpen] = useState(false);
  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalFieldsOpen, setModalFieldsOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchMaquinas() {
      try {
        const res = await fetch("/api/maquinas");
        if (res.ok) {
          const data = await res.json();
          setMaquinasExistentes(data);
        }
      } catch (err) {}
    }
    fetchMaquinas();
  }, []);

  useEffect(() => {
    const fetchSecoes = async () => {
      try {
        const response = await fetch("/api/secoes");
        if (!response.ok) {
          throw new Error("Erro ao buscar seções");
        }
        const data = await response.json();
        setSecoes(data);

        if (data.length > 0 && !secaoId) {
          setSecaoId(data[0].id.toString());
        }
      } catch (error) {
        setError("Erro ao carregar seções. Por favor, tente novamente.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecoes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Modal de campos obrigatórios
    if (!nome.trim() || !secaoId) {
      setModalFieldsOpen(true);
      setIsSubmitting(false);
      return;
    }

    // Modal de máquina já existente
    if (
      maquinasExistentes.some(
        (m) =>
          m.nome.trim().toLowerCase() === nome.trim().toLowerCase() &&
          String(m.secaoId) === String(secaoId)
      )
    ) {
      setModalExistenteOpen(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/cadmaquina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          secaoId: parseInt(secaoId),
          funcionando: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao cadastrar máquina");
      }

      setMaquinasExistentes([
        ...maquinasExistentes,
        { nome, secaoId: parseInt(secaoId) },
      ]);

      setNome("");
      setModalSuccessOpen(true); // Modal de sucesso
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <>
      {/* Modal de máquina já existente */}
      <Modal
        isOpen={modalExistenteOpen}
        title="Aviso"
        message="Já existe uma máquina com esse nome nesta seção."
        onClose={() => setModalExistenteOpen(false)}
      />
      {/* Modal de sucesso */}
      <Modal
        isOpen={modalSuccessOpen}
        title="Cadastro realizado"
        message="Máquina cadastrada com sucesso!"
        onClose={() => setModalSuccessOpen(false)}
      />
      {/* Modal de campos obrigatórios */}
      <Modal
        isOpen={modalFieldsOpen}
        title="Campos obrigatórios"
        message="Por favor, preencha todos os campos obrigatórios."
        onClose={() => setModalFieldsOpen(false)}
      />

      <div className={styles.body}>
        <Head>
          <title>Machine Registration</title>
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
              <h1 className={styles.h1Header}>Machine Registration</h1>
            </div>
            <div className={styles.menuLink}>
              <Link href="/painel/listmaquina" className={styles.menuItem}>
                <FaArrowLeft className={styles.divpMenu} />
              </Link>
            </div>
          </header>
        </div>

        <div className={styles.container}>
          <h1 className={styles.title}>Cadastrar Máquina</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {secoes.length === 0 && (
            <div className={styles.warningMessage}>
              Nenhuma seção cadastrada. Por favor, cadastre uma seção primeiro.
              <div className={styles.warningActions}>
                <button
                  onClick={() => router.push("/painel/cadastrar/secoes")}
                  className={styles.link}
                >
                  Cadastrar Seção
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="nome" className={styles.label}>
                Nome da Máquina
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={styles.input}
                placeholder="Digite o nome da máquina"
                disabled={isSubmitting || secoes.length === 0}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="secaoId" className={styles.label}>
                Seção
              </label>
              <select
                id="secaoId"
                value={secaoId}
                onChange={(e) => setSecaoId(e.target.value)}
                className={styles.select}
                disabled={isSubmitting || secoes.length === 0}
              >
                <option value="">Selecione uma seção</option>
                {secoes.map((secao) => (
                  <option key={secao.id} value={secao.id}>
                    {secao.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || secoes.length === 0}
              className={styles.button}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Máquina"}
            </button>
          </form>

          <div className={styles.linkContainer}>
            <button
              onClick={() => router.push("/painel/listmaquina")}
              className={styles.link}
            >
              Voltar para lista de máquinas
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
