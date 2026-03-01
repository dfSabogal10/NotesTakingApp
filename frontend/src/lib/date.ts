/**
 * Format updated_at ISO string as "Today" | "Yesterday" | "MMM DD"
 */
export function formatLastEdited(isoString: string | null | undefined): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime()) {
    return "today";
  }
  if (dateOnly.getTime() === yesterday.getTime()) {
    return "yesterday";
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
