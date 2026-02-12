import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const BACKEND_URL = API_BASE_URL.replace("/api/", "");

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export default api;
