export const logout = async () => {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );
};

export const getMe = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
};
