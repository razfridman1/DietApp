// Thin fetch wrapper used by client components.
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(url: string) => fetch(url, { credentials: "include" }).then(handle<T>),
  post: <T>(url: string, body?: unknown) =>
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).then(handle<T>),
  put: <T>(url: string, body?: unknown) =>
    fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).then(handle<T>),
  patch: <T>(url: string, body?: unknown) =>
    fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).then(handle<T>),
  del: <T>(url: string) =>
    fetch(url, { method: "DELETE", credentials: "include" }).then(handle<T>),
};
