import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import logoImg from "/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";
import { FaArrowLeft } from "react-icons/fa";

const EditSecao = () => {
  const router = useRouter();
  const { id } = router.query;
  const [secao, setSecao] = useState({ nome: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchSecao = async () => {
        try {
          const res = await fetch(`/api/secoes/${id}`);
          if (!res.ok) throw new Error("Erro ao buscar seção");
          const data = await res.json();
          setSecao({ nome: data.nome || "" });
        } catch {
          setError("Falha ao carregar dados da seção.");
        } finally {
          setLoading(false);
        }
      };
      fetchSecao();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSecao((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/secoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secao),
      });
      if (res.ok) {
        router.push("/painel/listsecao");
      } else {
        setError("Erro ao atualizar a seção. Verifique os dados.");
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Update Section</title>
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
              <h1 className={styles.h1Header}>Atualizar Seção</h1>
            </div>
          </div>
          <div className={styles.menuLink}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => router.push("/painel/listsecao")}
              aria-label="Voltar"
            >
              <FaArrowLeft />
            </button>
          </div>
        </header>
      </div>
      <main className={styles.container}>
        <div className={styles.card}>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <form
              className={styles.form}
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome da Seção</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={secao.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome da seção"
                  required
                  className={styles.input}
                  maxLength={50}
                />
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.divButton}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Atualizando..." : "Atualizar Seção"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditSecao;
