import React, { createContext, useCallback, useRef } from "react";

/**
 * NotificationContext - Gestisce tutte le notifiche dell'app
 */
export const NotificationContext = createContext();

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification deve essere usato dentro NotificationProvider");
  }
  return context;
}

/**
 * Hook interno per gestire le notifiche
 * Usato da NotificationProvider
 */
export function useNotifications() {
  const msgRef = useRef(null);

  const showToast = useCallback(
    (severity, summary, detail = "", life = 3000) => {
      if (msgRef.current) {
        msgRef.current.show({
          severity,
          summary,
          detail,
          life,
        });
      }
    },
    []
  );

  const success = useCallback(
    (summary, detail = "") => showToast("success", summary, detail),
    [showToast]
  );

  const error = useCallback(
    (summary, detail = "") => showToast("error", summary, detail),
    [showToast]
  );

  const warning = useCallback(
    (summary, detail = "") => showToast("warn", summary, detail),
    [showToast]
  );

  const info = useCallback(
    (summary, detail = "") => showToast("info", summary, detail),
    [showToast]
  );

  return {
    msgRef,
    showToast,
    success,
    error,
    warning,
    info,
  };
}

/**
 * Centralizza il trattamento degli errori API
 */
export function handleAPIError(error, showNotification) {
  let summary = "Error";
  let detail = "Something went wrong";

  if (error.name === "AbortError" || error.message === "Request timeout") {
    summary = "Timeout";
    detail = "The request took too long. Please try again.";
  } else if (error.status === 401) {
    summary = "Unauthorized";
    detail = "Your session has expired. Please login again.";
    // Qui puoi fare logout automatico se necessario
  } else if (error.status === 403) {
    summary = "Forbidden";
    detail = "You don't have permission to perform this action.";
  } else if (error.status === 404) {
    summary = "Not Found";
    detail = "The resource you're looking for doesn't exist.";
  } else if (error.status === 400) {
    summary = "Invalid Request";
    detail = error.message || "Please check your input.";
  } else if (error.status >= 500) {
    summary = "Server Error";
    detail = "The server encountered an error. Please try again later.";
  } else {
    summary = error.message || "Error";
    detail = error.data?.detail || error.data?.message || "";
  }

  if (showNotification) {
    showNotification.error(summary, detail);
  }

  return { summary, detail };
}
