// const isDev = import.meta.env.MODE === "development";

// const BASE_URL = isDev
//   ? "http://localhost:5014/api/v1"
//   : import.meta.env.VITE_API_URL || "https://blex-thlc.onrender.com/api/v1";

// const API_BASE = BASE_URL;

// const headers = { 'Content-Type': 'application/json' };

// function authFetch(url, options = {}) {
//   const token = localStorage.getItem("token");

//   return fetch(url, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(options.headers || {}),
//       Authorization: token ? `Bearer ${token}` : undefined
//     }
//   });
// }

// async function list(){
//   const res = await authFetch(`${API_BASE}/tests`);
//   return res.json();
// }

// async function get(id){
//   const res = await authFetch(`${API_BASE}/tests/${id}`);
//   return res.json();
// }

// async function submit(id, body){
//   const res = await authFetch(`${API_BASE}/tests/${id}/submit`, { method: 'POST', headers, body: JSON.stringify(body) });
//   return res.json();
// }

// async function getAttempt(id){
//   const res = await authFetch(`${API_BASE}/tests/attempt/${id}`);
//   return res.json();
// }

// async function listAttempts(){
//   const res = await authFetch(`${API_BASE}/tests/attempts`);
//   return res.json();
// }

// export default { list, get, submit, getAttempt, listAttempts };
