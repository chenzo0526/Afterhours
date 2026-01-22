import { Check } from "lucide-react";

type BulletsProps = {
  items: string[];
  columns?: 1 | 2 | 3;
};

export default function Bullets({ items, columns = 1 }: BulletsProps) {
  const columnClass =
    columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";

  return (
    <ul className={`mt-6 grid gap-3 text-sm text-muted-foreground ${columnClass}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 text-sky-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
