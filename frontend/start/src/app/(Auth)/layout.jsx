/** @format */
import NavigationTrail from "../_components/NavigationTrail";

export default function AuthLayout({ children }) {
  return (
    <main className="auth-shell">
      <div className="auth-page-context">
        <NavigationTrail className="page-navigation-trail auth-navigation-trail" />
        {children}
      </div>
    </main>
  );
}
