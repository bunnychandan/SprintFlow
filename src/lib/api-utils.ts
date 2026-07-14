export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function parsePagination(request: Request, defaultPageSize = 50): PaginationParams {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(defaultPageSize), 10)));
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
  };
}

export function paginationMeta(total: number, params: PaginationParams) {
  return {
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}
