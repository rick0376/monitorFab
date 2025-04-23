import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./styles.module.scss"; // Certifique-se de ter esse arquivo de estilo

const MachineList = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMaquinas = async () => {
      const res = await fetch("/api/maquinas");
      const data = await res.json();
      setMaquinas(data);
    };
    fetchMaquinas();
  }, []);

  const handleSelectMachine = (maquina) => {
    setSelectedMachine(maquina);
  };

  const handleDelete = async () => {
    if (!selectedMachine) return;

    const res = await fetch(`/api/maquinas/${selectedMachine.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelectedMachine(null); // Limpar seleção após exclusão
      alert("Máquina excluída com sucesso.");
      // Recarregar a lista de máquinas
      const updatedMaquinas = maquinas.filter(
        (maquina) => maquina.id !== selectedMachine.id
      );
      setMaquinas(updatedMaquinas);
    } else {
      alert(
        "Erro ao excluir a máquina! Verifica se tem alguma parada mêcanica registrada."
      );
    }
  };

  const handleEdit = () => {
    if (selectedMachine) {
      router.push(`/painel/editMachine?id=${selectedMachine.id}`);
    }
  };

  return (
    <div className={styles.machineListContainer}>
      <h2 className={styles.header}>Máquinas Registradas</h2>
      <div className={styles.machineList}>
        {maquinas.map((maquina) => (
          <div
            key={maquina.id}
            className={styles.machineItem}
            onClick={() => handleSelectMachine(maquina)}
          >
            <p className={styles.machineName}>{maquina.nome}</p>
          </div>
        ))}
      </div>

      {/* Exibir as opções de editar ou excluir */}
      {selectedMachine && (
        <div className={styles.editMachineContainer}>
          <h3 className={styles.editHeader}>
            Editando: {selectedMachine.nome}
          </h3>
          <div className={styles.buttonContainer}>
            <button onClick={handleEdit} className={styles.submitButton}>
              Editar Máquina
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              Excluir Máquina
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineList;
