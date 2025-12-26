export const logout = async () => {
  await fetch("/api/auth", {
    method: "DELETE",
  });
};

export const getMe = async () => {
  const res = await fetch("/api/auth", {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};
