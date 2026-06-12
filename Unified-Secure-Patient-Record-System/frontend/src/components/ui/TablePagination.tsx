interface TablePaginationProps {
  page: number;
  total: number;
  limit: number;
  onPrev: () => void;
  onNext: () => void;
  label?: string;
}

export function TablePagination({ page, total, limit, onPrev, onNext, label = 'records' }: TablePaginationProps) {
  const pages = Math.ceil(total / limit) || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 sm:px-6 border-t border-slate-100 text-xs font-bold text-slate-500">
      <span className="uppercase tracking-wider text-center sm:text-left">
        Showing {from}–{to} of {total} {label}
      </span>
      <div className="flex gap-2 justify-center sm:justify-end">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className="touch-target px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl disabled:opacity-30 hover:bg-white hover:shadow-subtle transition-all uppercase tracking-widest text-[10px]"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={onNext}
          className="touch-target px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl disabled:opacity-30 hover:bg-white hover:shadow-subtle transition-all uppercase tracking-widest text-[10px]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
