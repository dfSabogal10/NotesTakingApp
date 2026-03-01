"use client";

type CategoryButtonProps = {
  category: {
    id: number;
    name: string;
    color_hex: string;
    notes_count?: number;
  };
  selected: boolean;
  onClick: () => void;
};

export function CategoryButton({ category, selected, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-base  text-black transition-colors ${
        selected ? "font-bold" : "font-normal"
      }`}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: category.color_hex || "#a08060" }}
      />
      <span className="flex-1">{category.name}</span>
      {category.notes_count != null && (
        <span className="text-base font-normal text-black">{category.notes_count}</span>
      )}
    </button>
  );
}
