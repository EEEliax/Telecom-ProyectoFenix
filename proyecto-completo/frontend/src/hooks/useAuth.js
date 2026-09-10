import { setToken } from '../utils/auth';

export default function useAuth() {
  async function login(email, password) {
    const controller = new AbortController();
    // Abort after 10 seconds
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        return { success: true };
      }

      if (response.status === 401) {
        return { error: 'Credenciales inválidas.' };
      }

      if (response.status === 403) {
        return { error: 'Cuenta inactiva o cliente dado de baja.' };
      }

      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        return { error: data.message || 'Datos de acceso inválidos.' };
      }

      return { error: 'Error inesperado. Intente nuevamente.' };

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return { error: 'No se pudo conectar con el servidor. Intente nuevamente.' };
      }
      return { error: 'Error de conexión: ' + err.message };
    }
  }

  return { login };
}
