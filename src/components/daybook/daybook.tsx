'use client';

import { useState, useMemo, useCallback, useEffect, useRef, startTransition } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { useDaybook } from '@/services/base/store-admin/functions/useDaybookOrders';
import { useStore } from '@/store';
import Toolbar from '@/components/daybook/toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import ReceiptVoucherCard from '@/components/receipt-voucher-card';
import DeliveryVoucherCard from '@/components/delivery-voucher-card';

export default function DaybookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [sortFilter, setSortFilter] = useState('Latest First');
  const [currentPage, setCurrentPage] = useState(1);

  // Get store values for receipt voucher cards
  const { coldStorage, receiptVisibleColumns, setReceiptColumns } = useStore();

  const preferencesId = coldStorage?.preferences.id || '';

  // Map filter strings to API values
  const typeFilter = useMemo(() => {
    switch (orderFilter) {
      case 'Incoming':
        return 'incoming';
      case 'Outgoing':
        return 'outgoing';
      default:
        return 'all';
    }
  }, [orderFilter]);

  const sortByFilter = useMemo(() => {
    switch (sortFilter) {
      case 'Oldest First':
        return 'oldest';
      case 'Latest First':
      default:
        return 'latest';
    }
  }, [sortFilter]);

  // Wrapped handlers that reset page when filters change
  const handleOrderFilterChange = useCallback((filter: string) => {
    setOrderFilter(filter);
    setCurrentPage(1);
  }, []);

  const handleSortFilterChange = useCallback((filter: string) => {
    setSortFilter(filter);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Reset page when debounced search changes
  const prevDebouncedSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedSearch.current !== debouncedSearch) {
      prevDebouncedSearch.current = debouncedSearch;
      // Use startTransition to mark this as a lower-priority update
      startTransition(() => {
        setCurrentPage(1);
      });
    }
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } = useDaybook({
    type: typeFilter,
    sortBy: sortByFilter,
    search: debouncedSearch.trim() || undefined,
    page: currentPage,
    limit: 2,
  });

  const pagination = data?.pagination;

  // ✅ Render loading skeleton while fetching data
  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalOrders = data?.pagination?.totalItems ?? null;

  return (
    <div className="p-4">
      <Toolbar
        totalOrders={totalOrders}
        searchQuery={searchQuery}
        orderFilter={orderFilter}
        sortFilter={sortFilter}
        preferencesId={preferencesId}
        onSearchChange={handleSearchChange}
        onOrderFilterChange={handleOrderFilterChange}
        onSortFilterChange={handleSortFilterChange}
      />

      {isFetching && !isLoading && (
        <p className="text-xs text-muted-foreground mt-2">Refreshing data...</p>
      )}

      {isError && (
        <div className="mt-4 text-red-500 flex items-center gap-2">
          <p>Error: {error?.response?.data?.message || error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {data && (
        <>
          <div className="mt-4 space-y-4">
            {data.data.map((voucher) =>
              voucher.type === 'incoming' ? (
                <ReceiptVoucherCard
                  key={voucher.id}
                  data={voucher}
                  coldStorage={coldStorage}
                  receiptVisibleColumns={receiptVisibleColumns}
                  setReceiptColumns={setReceiptColumns}
                />
              ) : (
                <DeliveryVoucherCard key={voucher.id} data={voucher} />
              )
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasPreviousPage && pagination.previousPage) {
                          setCurrentPage(pagination.previousPage);
                        }
                      }}
                      className={
                        !pagination.hasPreviousPage
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {/* First page */}
                  {pagination.currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(1);
                          }}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {pagination.currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Previous page */}
                  {pagination.hasPreviousPage && pagination.previousPage && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pagination.previousPage!);
                        }}
                        className="cursor-pointer"
                      >
                        {pagination.previousPage}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink href="#" isActive className="cursor-pointer">
                      {pagination.currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {/* Next page */}
                  {pagination.hasNextPage && pagination.nextPage && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pagination.nextPage!);
                        }}
                        className="cursor-pointer"
                      >
                        {pagination.nextPage}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Last page */}
                  {pagination.currentPage < pagination.totalPages - 1 && (
                    <>
                      {pagination.currentPage < pagination.totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pagination.totalPages);
                          }}
                          className="cursor-pointer"
                        >
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasNextPage && pagination.nextPage) {
                          setCurrentPage(pagination.nextPage);
                        }
                      }}
                      className={
                        !pagination.hasNextPage
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
