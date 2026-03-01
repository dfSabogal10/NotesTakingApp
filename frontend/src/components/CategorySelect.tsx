"use client";

type Category = {
  id: number;
  name: string;
  color_hex: string;
};

type CategorySelectProps = {
  categories: Category[];
  value: number;
  onChange: (categoryId: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CategorySelect({
  categories,
  value,
  onChange,
  open,
  onOpenChange,
}: CategorySelectProps) {
  const selected = categories.find((c) => c.id === value) ?? categories[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex items-center gap-2.5 rounded-xl border-2 border-black/15 bg-transparent px-5 py-2.5 text-base font-medium text-black shadow-sm"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: selected?.color_hex || "#a08060" }}
        />
        <span>{selected?.name ?? "Select category"}</span>
        <span className="ml-1 text-xs text-[var(--sepia-light)]">&#9660;</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-2 min-w-[200px] rounded-xl border-2 border-black/10 bg-[#f5ede0] py-1 shadow-lg">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  onOpenChange(false);
                }}
                className="flex w-full items-center gap-2.5 px-5 py-3 text-left text-base text-black hover:bg-gray-50"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color_hex || "#a08060" }}
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
