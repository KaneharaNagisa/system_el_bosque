import { useEffect, useState } from "react";

export const ADMIN_PAGE_SIZE = 15;

export function useAdminPagination<T>(items: readonly T[]) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / ADMIN_PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    useEffect(() => {
        if (page !== currentPage) setPage(currentPage);
    }, [page, currentPage]);

    return {
        currentPage,
        setCurrentPage: setPage,
        pageItems: items.slice(
            (currentPage - 1) * ADMIN_PAGE_SIZE,
            currentPage * ADMIN_PAGE_SIZE,
        ),
    };
}

interface Props {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export default function AdminPagination({
    currentPage,
    totalItems,
    onPageChange,
}: Props) {
    if (totalItems <= ADMIN_PAGE_SIZE) return null;

    const totalPages = Math.ceil(totalItems / ADMIN_PAGE_SIZE);
    const firstItem = (currentPage - 1) * ADMIN_PAGE_SIZE + 1;
    const lastItem = Math.min(currentPage * ADMIN_PAGE_SIZE, totalItems);

    return (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-600">
                {firstItem}〜{lastItem}件 / 全{totalItems}件
            </p>
            <nav
                aria-label="ページネーション"
                className="flex items-center gap-2"
            >
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    前へ
                </button>
                <span className="text-sm text-gray-700">
                    {currentPage} / {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    次へ
                </button>
            </nav>
        </div>
    );
}
