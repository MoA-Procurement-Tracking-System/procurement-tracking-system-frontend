export function StatusText({
  className = "",
  label,
}: {
  className?: string;
  label: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-slate-700 " +
        className
      }
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
      />
      {label}
    </span>
  );
}
