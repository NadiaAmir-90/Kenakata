// src/components/ui/UserAvatar.tsx
const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-blue-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-amber-600",
  "bg-teal-600",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic color per name, so the same user always gets the same color
// instead of a random one flickering between renders.
function getColorForName(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function UserAvatar({ name, size = "h-8 w-8" }: { name: string; size?: string }) {
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-full ${getColorForName(name)} text-xs font-semibold text-white`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}