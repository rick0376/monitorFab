import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import logoImg from "/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./styles.module.scss";

const EditMachine = () => {
  const router = useRouter();
  const { id } = router.query;
  const [maquina, setMaquina] = useState({ nome: "", secaoId: "" });
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const resMaquina = await fetch(`/api/maquinas/${id}`);
          if (!resMaquina.ok) throw new Error("Erro ao buscar máquina");
          const dataMaquina = await resMaquina.json();

          const resSecoes = await fetch("/api/secoes");
          if (!resSecoes.ok) throw new Error("Erro ao buscar seções");
          const dataSecoes = await resSecoes.json();

          setMaquina({
            nome: dataMaquina.nome || "",
            secaoId: dataMaquina.secaoId || "",
          });
          setSecoes(dataSecoes);
        } catch (error) {
          setError("Falha ao carregar dados. Tente novamente.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaquina((prev) => ({
      ...prev,
      [name]: name === "secaoId" ? value : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/maquinas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...maquina,
          secaoId: maquina.secaoId || null,
        }),
      });
      if (res.ok) {
        router.push("/painel/listmaquina");
      } else {
        setError("Erro ao atualizar a máquina. Verifique os dados.");
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.body}>
      <Head>
        <title>Atualizar Máquina</title>
        <meta name="description" content="Editar dados da máquina" />
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
                priority
                quality={100}
              />
            </Link>
          </div>
          <div className={styles.headerCenter}>
            <h1 className={styles.h1Header}>Atualizar Máquina</h1>
          </div>
          <div className={styles.menuLink}>
            <Link
              href="/painel/listmaquina"
              className={styles.menuItem}
              aria-label="Voltar"
            >
              <FaArrowLeft />
            </Link>
          </div>
        </header>
      </div>

      <main className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.formTitle}>Editar Máquina</h2>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <form
              className={styles.form}
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome da Máquina</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={maquina.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome da máquina"
                  required
                  className={styles.input}
                  maxLength={50}
                />

                <label htmlFor="secaoId">Seção</label>
                <select
                  id="secaoId"
                  name="secaoId"
                  value={maquina.secaoId}
                  onChange={handleChange}
                  className={styles.select}
                  aria-label="Selecionar seção"
                >
                  <option value="">Sem Seção</option>
                  {secoes
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((secao) => (
                      <option key={secao.id} value={secao.id}>
                        {secao.nome}
                      </option>
                    ))}
                </select>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.divButton}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? "Atualizando..." : "Atualizar Máquina"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditMachine;
