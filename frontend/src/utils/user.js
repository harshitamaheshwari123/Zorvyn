export function mapUserFromApi(u) {
  if (!u) return null;
  return {
    id: u._id ?? u.id,
    name: u.name,
    email: u.email,
    role: u.role || "viewer",
    isActive: u.isActive,
  };
}
