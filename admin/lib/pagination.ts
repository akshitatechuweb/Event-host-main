export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export function paginateArray<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.min(Math.max(1, page), totalPages || 1);
  const offset = (currentPage - 1) * limit;

  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    meta: {
      totalItems,
      itemCount: paginatedItems.length,
      itemsPerPage: limit,
      totalPages,
      currentPage,
    },
  };
}
