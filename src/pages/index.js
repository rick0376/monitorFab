import Link from "next/link";
import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "./styles.module.scss";
import logoImg from "/public/logo.png"; // Substitua pelo caminho correto da imagem do logo
import Image from "next/image";

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.body}>
      <Head>
        <title>Machine Control Panel</title>
        <meta name="description" content="Cadastrar máquinas no sistema" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Header */}
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
              <h1 className={styles.h1Header}>Machine Control</h1>
            </div>
          </div>
        </header>
      </div>

      {/* Página de conteúdo */}
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.buttonContainer}>
            <div
              className={styles.button}
              onClick={() => setShowModal(true)}
              style={{ cursor: "pointer" }}
            >
              Controle Máquinas
            </div>

            <Link href="/painel/manutencao/intervencao">
              <div className={styles.button}>Relatório Intervenções</div>
            </Link>

            <Link href="/painel/manutencao/listintervencao">
              <div className={styles.button}>Lista de Intervenções</div>
            </Link>

            <Link href="/painel/listmaquina">
              <div className={styles.button}>Lista de Máquinas</div>
            </Link>

            <Link href="/painel/listsecao">
              <div className={styles.button}>Lista de Seções</div>
            </Link>

            <Link href="/painel/cadastrar/contatos">
              <div className={styles.button}>Contato</div>
            </Link>
          </div>
        </main>

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Escolha o tipo de monitoramento:</h2>
              <div className={styles.modalLinks}>
                <Link
                  href="/painel/controlmaquina/geral"
                  className={styles.modalLink}
                >
                  <div className={styles.buttonAbrir}>Máquina Geral</div>
                </Link>
                <Link
                  href="/painel/controlmaquina/secao"
                  className={styles.modalLink}
                >
                  <div className={styles.buttonAbrir}>Máquina Seção</div>
                </Link>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                <div className={styles.buttonFechar}>Fechar</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
