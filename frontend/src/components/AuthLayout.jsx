// Shared shell for Login and Register: brand panel on the left, form on the right.
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="auth-container">
    <aside className="auth-aside" aria-hidden="true">
      <div className="auth-wordmark">
        <span className="auth-logo">AI</span>
        <span>AI Chatbot</span>
      </div>

      <div className="auth-aside-body">
        <h2>Ask your documents. Get answers you can check.</h2>

        <figure className="sample-doc">
          <p>
            Either party may end this agreement with{" "}
            <mark>30 days&rsquo; written notice</mark>. Fees already paid are
            not refundable after the first 14 days.
          </p>
          <figcaption>Service agreement, section 8</figcaption>
        </figure>

        <div className="sample-chat">
          <p className="sample-question">
            How much notice do I need to cancel?
          </p>
          <p className="sample-answer">
            You need to give 30 days&rsquo; written notice.
            <span className="sample-source">Source: section 8</span>
          </p>
        </div>
      </div>
    </aside>

    <main className="auth-main">
      <section className="auth-card">
        <div className="auth-mobile-brand">
          <span className="auth-logo">AI</span>
        </div>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <p className="auth-footer">{footer}</p>
      </section>
    </main>
  </div>
);

export default AuthLayout;
