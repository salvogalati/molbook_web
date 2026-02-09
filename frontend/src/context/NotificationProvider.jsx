import React from "react";
import { Messages } from "primereact/messages";
import { NotificationContext, useNotifications } from "../hooks/useNotification.js";

/**
 * NotificationProvider - Wrap nell'App per fornire notifiche a tutta l'app
 */
export function NotificationProvider({ children }) {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      <Messages ref={notifications.msgRef} />
      {children}
    </NotificationContext.Provider>
  );
}
