import { useState, useCallback } from "react";
import apiClient from "../services/apiClient.js";

/**
 * useFetch - Hook generico per fetch con loading, error e retry
 */
export function useFetch(asyncFunction, options = {}) {
  const { onSuccess, onError, throwError = false } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        onError?.(err);
        if (throwError) throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError, throwError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * useProjects - Hook per operazioni sui progetti
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access_token");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getProjects(token);
      setProjects(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createProject = useCallback(
    async (name) => {
      try {
        const newProject = await apiClient.createProject({ name }, token);
        setProjects((prev) => [...prev, newProject]);
        return newProject;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [token]
  );

  const updateProject = useCallback(
    async (projectId, data) => {
      try {
        const updated = await apiClient.updateProject(projectId, data, token);
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updated : p))
        );
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [token]
  );

  const deleteProject = useCallback(
    async (projectId) => {
      try {
        await apiClient.deleteProject(projectId, token);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [token]
  );

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

/**
 * useMolecules - Hook per operazioni sulle molecole di un progetto
 */
export function useMolecules(projectId) {
  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access_token");

  const fetchMolecules = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMolecules(projectId, token);
      setMolecules(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  const createMolecule = useCallback(
    async (moleculeData) => {
      if (!projectId) throw new Error("Project ID is required");
      try {
        const newMolecule = await apiClient.createMolecule(
          projectId,
          moleculeData,
          token
        );
        setMolecules((prev) => [...prev, newMolecule]);
        return newMolecule;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [projectId, token]
  );

  const updateMolecule = useCallback(
    async (moleculeId, data) => {
      if (!projectId) throw new Error("Project ID is required");
      try {
        const updated = await apiClient.updateMolecule(
          projectId,
          moleculeId,
          data,
          token
        );
        setMolecules((prev) =>
          prev.map((m) => (m.id === moleculeId ? updated : m))
        );
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [projectId, token]
  );

  const deleteMolecule = useCallback(
    async (moleculeId) => {
      if (!projectId) throw new Error("Project ID is required");
      try {
        await apiClient.deleteMolecule(projectId, moleculeId, token);
        setMolecules((prev) => prev.filter((m) => m.id !== moleculeId));
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [projectId, token]
  );

const addColumn = useCallback(
  async (columnName) => {
    if (!projectId) throw new Error("Project ID is required");
    try {
      const response = await apiClient.addMoleculeColumn(projectId, { new_columns: [columnName] }, token);
      // opzionale: puoi aggiornare localmente molecules aggiungendo la nuova chiave vuota
      setMolecules((prev) =>
        prev.map((m) => ({ ...m, extra_data: { ...m.extra_data, [columnName]: "" } }))
      );
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  },
  [projectId, token]
);


  return {
    molecules,
    loading,
    error,
    fetchMolecules,
    createMolecule,
    updateMolecule,
    deleteMolecule,
    addColumn,
  };
}

/**
 * useForm - Hook per gestire form state e validazione
 */
export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        if (err.data && typeof err.data === "object") {
          setErrors(err.data);
        } else {
          setErrors({ submit: err.message });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}
