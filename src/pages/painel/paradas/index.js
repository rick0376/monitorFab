import { useState, useEffect } from "react";
import styles from "./styles.module.scss"; // Certifique-se de ter esse arquivo de estilo

const Paradas = () => {
  const [paradas, setParadas] = useState([]);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFinalizacao: "",
    status: "",
  });

  // Buscar as paradas com os filtros
  useEffect(() => {
    const fetchParadas = async () => {
      const queryParams = new URLSearchParams(filtros).toString();
      const res = await fetch(`/api/paradas?${queryParams}`);
      const data = await res.json();
      console.log(data);
      setParadas(data);
    };
    fetchParadas();
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={styles.paradasContainer}>
      <h1>Lista de Paradas</h1>

      {/* Filtros */}
      <div className={styles.filters}>
        <label htmlFor="dataInicio">Data Início:</label>
        <input
          type="date"
          id="dataInicio"
          name="dataInicio"
          value={filtros.dataInicio}
          onChange={handleFiltroChange}
        />

        <label htmlFor="dataFinalizacao">Data Finalização:</label>
        <input
          type="date"
          id="dataFinalizacao"
          name="dataFinalizacao"
          value={filtros.dataFinalizacao}
          onChange={handleFiltroChange}
        />

        <label htmlFor="status">Status:</label>
        <select
          name="status"
          value={filtros.status}
          onChange={handleFiltroChange}
        >
          <option value="">Todos</option>
          <option value="aberto">Aberto</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {/* Lista de paradas */}
      <div className={styles.paradaList}>
        {paradas.length > 0 ? (
          paradas.map((parada) => (
            <div key={parada.id} className={styles.paradaItem}>
              <h3>{parada.motivo}</h3>
              <p>Máquina: {parada.maquina?.nome}</p>{" "}
              {/* Aqui é onde mostramos o nome da máquina */}
              <p>Hora Início: {parada.horaInicio}</p>
              <p>Hora Finalização: {parada.horaFinalizacao}</p>
              <p>
                Status: {parada.horaFinalizacao ? "Finalizada" : "Em aberto"}
              </p>
              <p>Observações: {parada.observacao}</p>
            </div>
          ))
        ) : (
          <p>Não há paradas para exibir.</p>
        )}
      </div>
    </div>
  );
};

export default Paradas;
