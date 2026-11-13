import { Link } from "react-router-dom";

function AuthLayout({
  mode,
  title,
  subtitle,
  footer,
  children,
}) {
  const isLogin = mode === "login";

  return (
    <main className="auth-page">
      <div className="auth-layout container-fluid">
        <section className="auth-intro" aria-label="DriveEasy introduction">
          <Link className="auth-brand" to="/" aria-label="DriveEasy">
            <span>Drive</span>Easy
          </Link>
          <p className="auth-eyebrow">A better way to get there</p>
          <h1>Your next journey starts here.</h1>
          <p className="auth-description">
            Find the right ride for the road ahead. Browse a thoughtfully
            selected fleet and enjoy a car rental experience built around
            comfort, freedom, and confidence.
          </p>
          <div className="auth-trust-note">
            <span className="auth-trust-mark" aria-hidden="true">✦</span>
            <span>Make every mile a little more memorable.</span>
          </div>
        </section>

        <section className="auth-card" aria-label={isLogin ? "Login" : "Create account"}>
          <nav className="auth-tabs" aria-label="Account options">
            <Link
              to="/login"
              className={`auth-tab${isLogin ? " active" : ""}`}
              aria-current={isLogin ? "page" : undefined}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`auth-tab${!isLogin ? " active" : ""}`}
              aria-current={!isLogin ? "page" : undefined}
            >
              Create Account
            </Link>
          </nav>

          <div className="auth-card-heading">
            <p className="auth-card-kicker">{isLogin ? "Welcome back" : "Join DriveEasy"}</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {children}
          {footer}
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;
