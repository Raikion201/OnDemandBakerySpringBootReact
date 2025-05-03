import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const halfVisiblePages = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(currentPage - halfVisiblePages, 1);
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(endPage - maxVisiblePages + 1, 1);
        }

        const pages = [];

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('ellipsis-start');
            }
        }

        // Add visible pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('ellipsis-end');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-1 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
            </Button>

            {pageNumbers.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                    return (
                        <Button
                            key={`ellipsis-${index}`}
                            variant="outline"
                            size="icon"
                            disabled
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More pages</span>
                        </Button>
                    );
                }

                return (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => onPageChange(page as number)}
                    >
                        {page}
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
            </Button>
        </div>
    );
}