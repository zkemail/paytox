import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get parameters from URL
      const proofId = searchParams.get("proofId");
      const error = searchParams.get("error");

      if (error) {
        setError(error);

        // If opened in popup, send message to parent
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_ERROR",
              error: error,
            },
            window.location.origin
          );
          window.close();
        } else {
          // If not in popup, redirect to claim page with error
          setTimeout(() => {
            navigate("/claim?error=" + encodeURIComponent(error));
          }, 2000);
        }
        return;
      }

      if (proofId) {
        // If opened in popup, send message to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_SUCCESS",
              proofId: proofId,
            },
            window.location.origin
          );
          window.close();
        } else {
          // If not in popup, store in sessionStorage and redirect
          sessionStorage.setItem("google_auth_proofId", proofId);
          navigate("/claim?auth=success");
        }
      } else {
        setError("No proof ID received from authentication");
        setTimeout(() => {
          navigate("/claim?error=no_proof_id");
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {error ? (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h2 style={{ marginBottom: "12px" }}>Authentication Failed</h2>
            <p style={{ color: "var(--muted)", marginBottom: "16px" }}>
              {error}
            </p>
            <p className="help-text">Redirecting back to claim page...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
            <h2 style={{ marginBottom: "12px" }}>Authentication Successful</h2>
            <p style={{ color: "var(--muted)" }}>
              Processing your email data...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
