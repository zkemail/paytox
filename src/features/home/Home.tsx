import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
	return (
		<div className="home-container">
		<div className="home-hero">
			<img
				src="/ZKEmailLogo-light.svg"
				alt="ZK Email"
				className="home-logo"
			/>
				<h1 className="home-title">
					Send ETH to any <span className="gradient-text">social handle</span>
				</h1>
				<p className="home-subtitle">
					Powered by ZK Email proofs and ENS names
				</p>
			</div>

			<div className="home-cards">
				<Link to="/tip" className="home-card">
					<div className="home-card-icon">💸</div>
					<h2 className="home-card-title">Send a Tip</h2>
					<p className="home-card-description">
						Send ETH to any social handle (X, Discord, and more). They'll be able to claim it with just an email.
					</p>
					<div className="home-card-cta">
						Get started →
					</div>
				</Link>

				<Link to="/claim" className="home-card">
					<div className="home-card-icon">🎁</div>
					<h2 className="home-card-title">Claim Your Tips</h2>
					<p className="home-card-description">
						Check your balance and withdraw tips sent to your social handle.
					</p>
					<div className="home-card-cta">
						Check balance →
					</div>
				</Link>
			</div>

			<div className="home-features">
				<div className="feature-badge">🔒 Zero-Knowledge Proofs</div>
				<div className="feature-badge">⚡ Powered by ENS</div>
				<div className="feature-badge">🌐 No Signup Required</div>
			</div>
		</div>
	);
}

