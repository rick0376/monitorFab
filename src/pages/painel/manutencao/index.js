import { useState, useEffect } from "react";
import logoImg from "/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.scss";

export default function Paradas() {
  const [maquinas, setMaquinas] = useState([]);
  const [maquinaId, setMaquinaId] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [motivo, setMotivo] = useState("");
  const [equipeAtuando, setEquipeAtuando] = useState("");
  const [horaFinalizacao, setHoraFinalizacao] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    const fetchMaquinas = async () => {
      const res = await fetch("/api/maquinas");
      const data = await res.json();
      setMaquinas(data);
    };
    fetchMaquinas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/paradas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maquinaId,
        horaInicio,
        motivo,
        equipeAtuando,
        horaFinalizacao,
        observacao,
      }),
    });
  };

  return (
    <div className={styles.body}>
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
              <h1 className={styles.h1Header}>Relatório de Intervenção</h1>
            </div>
          </div>
          <div className={styles.menuLink}>
            <Link href="/" className={styles.menuItem}>
              Home
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
              checked={horaFinalizacao}
              onChange={(e) =>
                setHoraFinalizacao(e.target.checked ? new Date() : null)
              }
            />
            <label>Máquina Funcionando</label>
          </div>

          <button type="submit" className={styles.buttonSearch}>
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}
