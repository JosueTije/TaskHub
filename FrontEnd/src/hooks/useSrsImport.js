import { useState } from "react";
import { API_URL } from "../services/api";

export function useSrsImport({ sprintId, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [createdCount, setCreatedCount] = useState(0);

  async function analyze(file) {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/sprints/${sprintId}/srs/analyze`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al analizar el PDF");
        return;
      }

      setTickets(data.tickets);
      setDevelopers(data.developers || []);
      setStep(2);
    } catch {
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/sprints/${sprintId}/srs/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al crear los tickets");
        return;
      }

      setCreatedCount(data.created);
      setStep(3);
      onSuccess?.();
    } catch {
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  }

  function updateTicket(index, field, value) {
    setTickets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  }

  function removeTicket(index) {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setStep(1);
    setError(null);
    setTickets([]);
    setDevelopers([]);
    setCreatedCount(0);
    setLoading(false);
  }

  return { step, loading, error, tickets, developers, createdCount, analyze, confirm, updateTicket, removeTicket, reset };
}
