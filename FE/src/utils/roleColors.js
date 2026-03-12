/** Maps user roles to Tailwind avatar background colours */
export const roleAvatarBg = {
  Tutor: "bg-purple-500",
  Mentor: "bg-emerald-500",
  Student: "bg-blue-500",
};

/** Returns the first two initials from a full name */
export function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
