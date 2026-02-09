import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "primereact/card";
import { Image } from "primereact/image";
import { ProgressSpinner } from "primereact/progressspinner";
import { API_URL } from "../services/api";

import "./styles/VerifyEmail.css";

// Possible states for the email verification process
const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  FAILURE: "failure",
};

export default function VerifyEmail() {
  // Extract the verification key from the URL parameters
  const { key } = useParams();
  const [status, setStatus] = useState(STATUS.LOADING);

  /**
   * Sends a POST request to verify the provided key
   * Updates the status based on the response outcome
   */
  const verifyEmail = useCallback(async () => {
    if (!key) return;
    setStatus(STATUS.LOADING);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/registration/verify-email/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        }
      );

      if (!response.ok) {
        // Attempt to parse error detail, fallback to generic message
        const { detail } = (await response.json().catch(() => ({})));
        throw new Error(detail || "Email verification failed");
      }

      setStatus(STATUS.SUCCESS);
    } catch (error) {
      console.error("Verification error:", error);
      setStatus(STATUS.FAILURE);
    }
  }, [key]);

  // Trigger verification when component mounts or 'key' changes
  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  /**
   * Renders appropriate feedback based on verification status:
   * - Spinner during the API call
   * - Error message on failure
   * - Success message on success
   */
  const renderContent = () => {
    if (status === STATUS.LOADING) {
      return (
        <div className="verify-message-wrapper">
          <ProgressSpinner className="verify-spinner" />
          <h3>Verifying email...</h3>
        </div>
      );
    }

    if (status === STATUS.FAILURE) {
      return (
        <div className="verify-message-wrapper">
          <i className="pi pi-times-circle verify-icon failure" />
          <h3>Verification failed</h3>
          <p>
            Please return to{' '}
            <Link to="/login" className="p-link">
              login
            </Link>{' '}
            and request a new verification link.
          </p>
        </div>
      );
    }

    if (status === STATUS.SUCCESS) {
      return (
        <div className="verify-message-wrapper">
          <i className="pi pi-check-circle verify-icon success" />
          <h3>Email verified successfully!</h3>
          <p>
            You can now{' '}
            <Link to="/login" className="p-link">
              log in
            </Link>{' '}
            with your account.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="verify-container">
      <div className="verify-card-wrapper">
        <div className="verify-logo-container">
          <Image
            className="logo-login"
            alt="MolBook Logo"
            width={400}
            src="https://molbookpro.farm.unipi.it/wp-content/uploads/2024/09/MB02.png"
          />
        </div>

        <Card title="Verify Email" className="verify-card">
          {renderContent()}
        </Card>
      </div>
    </div>
  );
}
