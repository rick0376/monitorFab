"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import logoImg from "/public/logo.png";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./styles.module.scss";

export default function CadastrarSecao() {
  const [nome, setNome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [secoesExistentes, setSecoesExistentes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchSecoes() {
      try {
        const res = await fetch("/api/secoes");
        if (res.ok) {
          const data = await res.json();
          setSecoesExistentes(data);
        }
      } catch (err) {}
    }
    fetchSecoes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!nome.trim()) {
      setError("O nome da seção é obrigatório");
      setIsSubmitting(false);
      return;
    }

    if (
      secoesExistentes.some(
        (secao) => secao.nome.trim().toLowerCase() === nome.trim().toLowerCase()
      )
    ) {
      setError("Já existe uma seção com esse nome.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/secoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar seção");
      }

      setNome("");
      router.refresh();
      setSecoesExistentes([...secoesExistentes, { nome }]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Section Registration</title>
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
            <h1 className={styles.h1Header}>Section Registration</h1>
          </div>
          <div className={styles.menuLink}>
            <Link href="/painel/listsecao" className={styles.menuItem}>
              <FaArrowLeft className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Cadastrar Seção</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nome" className={styles.label}>
              Nome da Seção
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={styles.input}
              placeholder="Digite o nome da seção"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.button}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Seção"}
          </button>
        </form>

        <div className={styles.linkContainer}>
          <button
            onClick={() => router.push("/painel/listsecao")}
            className={styles.link}
          >
            Voltar para lista de seções
          </button>
        </div>
      </div>
    </div>
  );
}
