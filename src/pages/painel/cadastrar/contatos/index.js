import React, { useState, useEffect } from "react";
import Head from "next/head";
import logoImg from "/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import styles from "./styles.module.scss";

const Modal = ({ isOpen, title, message, onClose, type = "info" }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3
          className={
            type === "error" ? styles.modalTitleError : styles.modalTitleSuccess
          }
        >
          {title}
        </h3>
        <p className={styles.modalMessage}>{message}</p>
        <button onClick={onClose} className={styles.modalButton}>
          OK
        </button>
      </div>
    </div>
  );
};

const ContactForm = () => {
  const [numeroInput, setNumeroInput] = useState("");
  const [nome, setNome] = useState("");
  const [contatos, setContatos] = useState([]);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleAddNumber = async () => {
    if (!nome || !numeroInput) {
      setModal({
        isOpen: true,
        title: "Atenção",
        message: "Nome e número são obrigatórios.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/contatos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          celular: numeroInput,
        }),
      });

      if (!res.ok) {
        setModal({
          isOpen: true,
          title: "Contato já existe",
          message: "Já existe este número cadastrado.",
          type: "error",
        });
      } else {
        setModal({
          isOpen: true,
          title: "Sucesso",
          message: "Contato adicionado com sucesso.",
          type: "success",
        });
        setNome("");
        setNumeroInput("");
        fetchContatos();
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "Erro ao adicionar o contato.",
        type: "error",
      });
    }
  };

  const fetchContatos = async () => {
    try {
      const res = await fetch("/api/contatos");
      const data = await res.json();
      if (res.ok) {
        setContatos(data.contatos);
      } else {
        setModal({
          isOpen: true,
          title: "Erro",
          message: "Erro ao carregar contatos.",
          type: "error",
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "Erro ao carregar contatos.",
        type: "error",
      });
    }
  };

  const handleRemoveNumber = async (id) => {
    try {
      const res = await fetch(`/api/contatos?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setModal({
          isOpen: true,
          title: "Sucesso",
          message: "Contato excluído com sucesso.",
          type: "success",
        });
        fetchContatos();
      } else {
        setModal({
          isOpen: true,
          title: "Erro",
          message: "Erro ao excluir o contato.",
          type: "error",
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Erro",
        message: "Erro ao excluir o contato.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchContatos();
  }, []);

  return (
    <div className={styles.body}>
      <Head>
        <title>Lista Contato</title>
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
              <h1 className={styles.h1Header}>Lista de Contato</h1>
            </div>
          </div>
          <div className={styles.menuLink}>
            <Link href="/" className={styles.menuItem}>
              <FaArrowLeft className={styles.divpMenu} />
            </Link>
          </div>
        </header>
      </div>

      <div className={styles.contactForm}>
        <h1>Cadastrar Contato</h1>

        {/* Formulário de Cadastro de Contato */}
        <div className={styles.inputGroup}>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do contato"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Celular (com DDD):</label>
          <PhoneInput
            international={false}
            defaultCountry="BR"
            value={numeroInput}
            onChange={setNumeroInput}
            placeholder="Ex: (11) 99999-9999"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.buttoAdicionar}
            type="button"
            onClick={handleAddNumber}
          >
            Adicionar
          </button>
        </div>

        {/* Exibindo a lista de contatos */}
        <div className={styles.contactList}>
          <h2>Contatos Cadastrados</h2>
          {contatos.length === 0 ? (
            <p>Não há contatos cadastrados.</p>
          ) : (
            <ul>
              {contatos.map((contato) => (
                <li key={contato.id} className={styles.contactItem}>
                  <div className={styles.contactDetails}>
                    <p>
                      <strong>{contato.nome}</strong>: {contato.celular}
                    </p>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemoveNumber(contato.id)}
                    >
                      <FaTrash size={20} color="red" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de alerta e sucesso */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
      />
    </div>
  );
};

export default ContactForm;
