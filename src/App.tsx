import "./App.css";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./features/home/Home";
import Pay from "./features/pay/Pay";
import Claim from "./features/claim/Claim";
import OAuthCallback from "./features/auth/OAuthCallback";

function App() {
  const location = useLocation();

  return (
    <div>
      <nav className="nav">
        <div className="container nav-inner">
          <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
            <img
              src="/favicon-light.svg"
              alt="Socials"
              style={{
                height: "28px",
                width: "28px",
              }}
            />
            <span>socials</span>
          </Link>
          <div className="nav-actions">
            <Link
              to="/tip"
              className="nav-cta"
              aria-current={location.pathname === "/tip" ? "page" : undefined}
            >
              Send Tips
            </Link>
            <Link
              to="/claim"
              className="nav-cta"
              aria-current={location.pathname === "/claim" ? "page" : undefined}
            >
              Claim Tips
            </Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tip" element={<Pay />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
      </Routes>
    </div>
  );
}

export default App;
