import { API_CONFIG, ENDPOINTS } from "../constants/config.js";

/**
 * API Client - Centralizza tutte le chiamate API con gestione auth e errori
 */
class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Ritorna gli header di default con token di autenticazione
   */
  getHeaders(token = null) {
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      // Prova a ottenere il token dal localStorage
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  /**
   * Esegue una richiesta HTTP con timeout e error handling
   */
  async request(method, url, options = {}) {
    const { data, token, timeout = this.timeout, ...otherOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(token),
        signal: controller.signal,
        ...(data && { body: JSON.stringify(data) }),
        ...otherOptions,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.detail ||
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Gestisci response vuoto (es. DELETE con 204)
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      throw error;
    }
  }

  // METODI DI UTILITÀ
  get(url, options = {}) {
    return this.request("GET", url, options);
  }

  post(url, data, options = {}) {
    return this.request("POST", url, { data, ...options });
  }

  patch(url, data, options = {}) {
    return this.request("PATCH", url, { data, ...options });
  }

  put(url, data, options = {}) {
    return this.request("PUT", url, { data, ...options });
  }

  delete(url, options = {}) {
    return this.request("DELETE", url, options);
  }

  // METODI SPECIFICI PER LE API
  async login(email, password) {
    const url = `${this.baseURL}${ENDPOINTS.AUTH.LOGIN}`;
    return this.post(url, { email, password });
  }

  async register(payload) {
    const url = `${this.baseURL}${ENDPOINTS.AUTH.REGISTER}`;
    return this.post(url, payload);
  }

  async getCurrentUser(token) {
    const url = `${this.baseURL}${ENDPOINTS.AUTH.ME}`;
    return this.get(url, { token });
  }

  async getProjects(token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.LIST}`;
    return this.get(url, { token });
  }

  async getProject(projectId, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.DETAIL(projectId)}`;
    return this.get(url, { token });
  }

  async createProject(data, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.LIST}`;
    return this.post(url, data, { token });
  }

  async updateProject(projectId, data, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.DETAIL(projectId)}`;
    return this.patch(url, data, { token });
  }

  async deleteProject(projectId, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.DETAIL(projectId)}`;
    return this.delete(url, { token });
  }

  async getMolecules(projectId, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.MOLECULES(projectId)}`;
    return this.get(url, { token });
  }

  async getMolecule(projectId, moleculeId, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.MOLECULE_DETAIL(
      projectId,
      moleculeId
    )}`;
    return this.get(url, { token });
  }

  async createMolecule(projectId, data, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.MOLECULES(projectId)}`;
    return this.post(url, data, { token });
  }

  async updateMolecule(projectId, moleculeId, data, token) {
    //console.log("Updating molecule", moleculeId, "with data", data);
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.MOLECULE_DETAIL(
      projectId,
      moleculeId
    )}`;
    return this.patch(url, data, { token });
  }

  async addMoleculeColumn(projectId, payload, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.MOLECULES_COLUMNS(projectId)}`;
    return this.post(url, payload, { token });
  }

  async deleteMolecule(projectId, moleculeId, token) {
    const url = `${this.baseURL}${ENDPOINTS.PROJECTS.MOLECULE_DETAIL(
      projectId,
      moleculeId
    )}`;
    return this.delete(url, { token });
  }

  async getUIState(scope = "projects_dashboard", token) {
    const qs = new URLSearchParams({ scope }).toString();
    const url = `${this.baseURL}/api/ui-state?${qs}`;
    return this.get(url, { token });
  }

  async saveUIState(scope = "projects_dashboard", state, token) {
    const qs = new URLSearchParams({ scope }).toString();
    const url = `${this.baseURL}/api/ui-state?${qs}`;
    return this.put(url, { scope, state }, { token });
  }
}

// Esporta istanza singleton
export default new APIClient();
