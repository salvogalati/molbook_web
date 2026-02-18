// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  DECIMER_URL: import.meta.env.VITE_DECIMER_API_URL,
  TIMEOUT: 30000,
};

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register/",
    LOGIN: "/api/auth/login/",
    ME: "/api/auth/me/",
    LOGOUT: "/api/auth/logout/",
    RESEND_EMAIL: "/api/auth/registration/resend-email/",
    VERIFY_EMAIL: "/api/auth/registration/verify-email/",
    PASSWORD_RESET: "/api/auth/password/reset-pwd/",
    PASSWORD_CONFIRM: "/api/auth/password/reset/confirm/",
  },
  PROJECTS: {
    LIST: "/api/projects/",
    DETAIL: (id) => `/api/projects/${id}/`,
    MOLECULES: (projectId) => `/api/projects/${projectId}/molecules/`,
    MOLECULE_DETAIL: (projectId, moleculeId) =>
      `/api/projects/${projectId}/molecules/${moleculeId}/`,
    MOLECULES_COLUMNS: (projectId) =>
    `/api/projects/${projectId}/molecules/columns/`,
    MOLECULES_REMOVE_COLUMN: (projectId) =>
  `/api/projects/${projectId}/molecules/remove_column/`,
  },
  USERS: {
    DETAIL: (id) => `/api/users/${id}/`,
  },
};

// Other Constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export const FAILED_IMAGE_URL =
  "https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/LD7WEPSAP7XPVEERGVIKMYX24Q.JPG&w=1800&h=1800";
