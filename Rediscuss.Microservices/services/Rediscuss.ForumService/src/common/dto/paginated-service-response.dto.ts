

export class PaginatedServiceResponseDto<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
    constructor(data: T[], total: number, page: number, pageSize: number) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = Math.ceil(total / pageSize);
        this.hasNextPage = page < this.totalPages;
        this.hasPreviousPage = page > 1;
        this.nextPage = this.hasNextPage ? page + 1 : null;
        this.previousPage = this.hasPreviousPage ? page - 1 : null;
    }
}