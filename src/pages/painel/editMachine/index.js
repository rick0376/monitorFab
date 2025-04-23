import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./styles.module.scss"; // Certifique-se de ter esse arquivo de estilo

const EditMachine = () => {
  const router = useRouter();
  const { id } = router.query;
  const [maquina, setMaquina] = useState({
    nome: "",
    funcionando: true,
  });

  useEffect(() => {
    if (id) {
      const fetchMachine = async () => {
        const res = await fetch(`/api/maquinas/${id}`);
        const data = await res.json();
        setMaquina(data);
      };
      fetchMachine();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMaquina({
      ...maquina,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedMachine = {
      ...maquina,
      funcionando: maquina.funcionando, // Asegure-se de que o estado 'funcionando' seja passado
    };

    const res = await fetch(`/api/maquinas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedMachine),
    });

    if (res.ok) {
      router.push("/painel/dashboard"); // Redireciona para o dashboard após a atualização
    } else {
      console.error("Erro ao atualizar a máquina");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Editar Máquina</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nome">Nome da Máquina</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={maquina.nome}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="funcionando">Máquina Funcionando</label>
          <input
            type="checkbox"
            id="funcionando"
            name="funcionando"
            checked={maquina.funcionando}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Atualizar Máquina
        </button>
      </form>

      <div>
        <button onClick={() => router.push("/painel/dashboard")}>Voltar</button>
      </div>
    </div>
  );
};

export default EditMachine;
