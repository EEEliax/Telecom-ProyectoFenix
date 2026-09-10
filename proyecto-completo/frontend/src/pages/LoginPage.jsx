import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { getToken, isTokenValid } from '../utils/auth';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  // Todos los hooks se llaman incondicionalmente en cada render, en el mismo
  // orden (Rules of Hooks). El early-return por sesión válida se evalúa
  // DESPUÉS de que todos los hooks ya fueron invocados.
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [errorMsg, setErrorMsg]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirement 6.5 — auto-redirect if already authenticated
  const token = getToken();
  if (isTokenValid(token)) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Requirement 6.6 — client-side validation
    const errors = { email: '', password: '' };
    if (!email.trim())    errors.email    = 'El email es requerido.';
    if (!password.trim()) errors.password = 'La contraseña es requerida.';
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({ email: '', password: '' });

    setIsSubmitting(true);
    setErrorMsg('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 80% 0%, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0) 100%), radial-gradient(50% 50% at 0% 100%, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0) 100%)',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-md">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <Radio className="h-6 w-6" />
            </span>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark">
                ConectaMax <span className="text-primary">Telecom</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Portal Corporativo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-brand-dark">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  fieldErrors.email ? 'border-red-400' : 'border-border'
                }`}
                placeholder="tu@email.com"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-brand-dark">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  fieldErrors.password ? 'border-red-400' : 'border-border'
                }`}
                placeholder="Tu contraseña"
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* General error message */}
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Back link */}
          <div className="text-center mt-6">
            <Link to="/" className="text-sm font-medium text-primary hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
