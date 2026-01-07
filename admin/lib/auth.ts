import { clientFetch } from "./client";

export const logout = async () => {
  await clientFetch("/admin/auth/logout", {
    method: "POST",
  });
};

export const getMe = async () => {
  const res = await clientFetch("/admin/auth/me", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
};
