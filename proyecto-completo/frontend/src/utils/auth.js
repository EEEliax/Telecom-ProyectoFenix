import { jwtDecode } from 'jwt-decode';

export function getToken() {
  return sessionStorage.getItem('token');
}

export function setToken(jwt) {
  sessionStorage.setItem('token', jwt);
}

export function removeToken() {
  sessionStorage.removeItem('token');
}

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
