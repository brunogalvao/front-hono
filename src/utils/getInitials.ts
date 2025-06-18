export const getInitials = (
  name?: string | null,
  email?: string | null
): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  }

  if (email && email.includes("@")) {
    const prefix = email.split("@")[0];
    return (prefix[0] + (prefix[1] ?? "")).toUpperCase();
  }

  return "??";
};
