import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

// Auth uses httpOnly cookies set by the backend. We enable `withCredentials`
// so the browser sends the session cookie on every request. No token is
// stored in localStorage/JS — mitigates XSS token theft.
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
  withCredentials: true,
});
