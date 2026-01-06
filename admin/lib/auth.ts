export const logout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
};

export const getMe = async () => {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
};
