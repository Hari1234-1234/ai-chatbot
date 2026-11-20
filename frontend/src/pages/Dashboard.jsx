import { useAuth } from "../context/AuthContext";
import DocumentManager from "../components/DocumentManager";
import { useNavigate } from "react-router-dom";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="auth-logo">AI</span>
          <span>AI Chatbot</span>
        </div>

        <section className="sidebar-profile" aria-label="Your profile">
          <span className="sidebar-avatar" aria-hidden="true">
            {getInitials(user?.name)}
          </span>

          <div className="sidebar-identity">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>

          <dl className="sidebar-details">
            <div>
              <dt>User ID</dt>
              <dd>{user?.id}</dd>
            </div>
          </dl>
        </section>

        <nav className="sidebar-nav" aria-label="Main">
          <span className="nav-item is-active" aria-current="page">
            Documents
          </span>
          <button
            type="button"
            className="nav-item"
            onClick={() => navigate("/chat")}
          >
            Ask questions
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-sidebar" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          <h1 className="page-title">Welcome, {firstName}</h1>
          <p className="page-lead">
            Upload your documents here. Once they&rsquo;re in, you&rsquo;ll be
            able to ask questions about them.
          </p>

          <DocumentManager />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
