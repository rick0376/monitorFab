import Link from "next/link";
import Head from "next/head";
import { useState } from "react";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false); // Para controle de carregamento
  const [message, setMessage] = useState(""); // Para mensagens de sucesso ou erro

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia o carregamento

    try {
      const res = await fetch("/api/maquinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        const maquina = await res.json();
        setMessage(`Máquina ${maquina.nome} cadastrada com sucesso!`);
      } else {
        const error = await res.json();
        setMessage(`Erro: ${error.message || "Erro ao cadastrar máquina"}`);
      }
    } catch (error) {
      setMessage(`Erro de conexão: ${error.message}`);
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro de Máquinas</title>
        <meta name="description" content="Cadastrar máquinas no sistema" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Cadastrar Máquina</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da máquina"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
          {message && <p>{message}</p>}{" "}
          {/* Exibe a mensagem de sucesso ou erro */}
          <div>
            <h2>Navegação</h2>
            <br />
            <Link href="/painel/manutencao">Registrar Parada de Máquinas</Link>
            <br />
            <br />
            <Link href="/painel/dashboard">Ir para o Dashboard</Link>
            <br />
            <br />
            <Link href="/painel/dashboardT">Ir para o Dashboard2</Link>
            <br />
            <br />
            <Link href="/painel/machinesList">Ir para o machinesList</Link>
            <br />
            <br />
            <Link href="/painel/manutencao/maquinaoff">
              Trabalhar nela Parada de Máquinas
            </Link>
            <br />
            <br />
            <Link href="/painel/paradas">Todas paradas</Link>
          </div>
        </main>
      </div>
    </>
  );
}
