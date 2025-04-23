import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles.module.scss"; // Certifique-se de que o caminho está correto

const EditParada = () => {
  const router = useRouter();
  const { id } = router.query; // Pega o ID da parada da URL
  const [parada, setParada] = useState({
    motivo: "",
    horaInicio: "",
    horaFinalizacao: "",
    observacao: "",
    funcionando: true, // Adicionando a variável para o status da máquina
  });

  const [funcionando, setFuncionando] = useState(false); // Define o estado do checkbox

  useEffect(() => {
    if (id) {
      const fetchParada = async () => {
        const res = await fetch(`/api/paradas/${id}`);
        const data = await res.json();

        // Verificando se a parada foi encontrada
        if (data) {
          setParada({
            motivo: data.motivo || "",
            horaInicio: formatDateToLocal(data.horaInicio) || "",
            horaFinalizacao: formatDateToLocal(data.horaFinalizacao) || "",
            observacao: data.observacao || "",
            funcionando: data.maquina ? data.maquina.funcionando : true, // Garantindo que funcione mesmo se a máquina estiver sem dados
          });
          setFuncionando(data.maquina ? data.maquina.funcionando : true);
        }
      };
      fetchParada();
    }
  }, [id]);

  // Função para formatar a data para o formato necessário do input datetime-local (YYYY-MM-DDTHH:mm)
  const formatDateToLocal = (date) => {
    if (!date) return "";
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Função para formatar o valor de data e hora para o formato que o banco de dados espera (ISO 8601)
  const formatDateToDatabase = (date) => {
    if (!date) return null;
    const localDate = new Date(date);
    return localDate.toISOString(); // Retorna o formato ISO completo: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParada({
      ...parada,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Função para tratar o envio dos dados
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Antes de enviar os dados, converta as datas para o formato correto do banco de dados
    const updatedParada = {
      ...parada,
      horaInicio: formatDateToDatabase(parada.horaInicio),
      horaFinalizacao: formatDateToDatabase(parada.horaFinalizacao),
      funcionando: funcionando, // Adicionando o estado do checkbox 'funcionando'
    };

    const res = await fetch(`/api/paradas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedParada),
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Parada atualizada:", result);
      router.push("/painel/dashboard"); // Redireciona após sucesso
    } else {
      console.error("Erro ao atualizar a parada");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta parada?"
    );

    if (confirmDelete) {
      const res = await fetch(`/api/paradas/${id}`, {
        method: "DELETE", // Método HTTP para deletar
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        console.log("Parada excluída com sucesso");
        router.push("/painel/dashboard"); // Redireciona para o dashboard após exclusão
      } else {
        console.error("Erro ao excluir a parada");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1>Editar Parada</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="motivo">Motivo</label>
          <input
            type="text"
            id="motivo"
            name="motivo"
            value={parada.motivo}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="horaInicio">Hora de Início</label>
          <input
            type="datetime-local"
            id="horaInicio"
            name="horaInicio"
            value={parada.horaInicio}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="horaFinalizacao">Hora de Finalização</label>
          <input
            type="datetime-local"
            id="horaFinalizacao"
            name="horaFinalizacao"
            value={parada.horaFinalizacao}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="observacao">Observação</label>
          <textarea
            id="observacao"
            name="observacao"
            value={parada.observacao}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Campo para alterar o status da máquina */}
        <div className={styles.formGroup}>
          <label htmlFor="funcionando">Máquina Funcionando</label>
          <input
            type="checkbox"
            id="funcionando"
            checked={funcionando} // Usa o estado 'funcionando' para o estado do checkbox
            onChange={(e) => setFuncionando(e.target.checked)} // Atualiza o estado 'funcionando'
          />
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitButton}>
            Atualizar Parada
          </button>

          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
          >
            Excluir Parada
          </button>
        </div>
      </form>
      <div>
        <Link href="/painel/dashboard">Voltar para o Dashboard</Link>
      </div>
    </div>
  );
};

export default EditParada;
