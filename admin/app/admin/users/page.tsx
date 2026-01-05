"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserSearch } from "@/components/users/UserSearch";
import { UserTableHeader } from "@/components/users/UserTableHeader";
import { UserTableRow } from "@/components/users/UserTableRow";
import { fetchRegularUsers, deactivateUser, User } from "@/lib/users";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const loadUsers = async (pageNum: number, search = ""): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchRegularUsers({
        page: pageNum,
        search: search || undefined,
      });

      setUsers(data.users);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load users:", error);
      alert("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, debouncedSearch);
  }, [debouncedSearch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    loadUsers(newPage, searchQuery);
  };

  const handleDeactivate = async (userId: string): Promise<void> => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await deactivateUser(userId);
      alert("User deactivated successfully");
      loadUsers(page, searchQuery);
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      alert("Failed to deactivate user");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Users
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor registered users ({total} total)
            </p>
          </div>
        </div>

        <UserSearch onSearch={handleSearch} />

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <UserTableHeader />

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <>
              {users.map((user) => (
                <UserTableRow
                  key={user._id}
                  user={{
                    name: user.name || "Unnamed",
                    email: user.email ?? "N/A",
                    phone: user.phone ?? "N/A",
                    city: user.city || "N/A",
                    status: user.isActive ? "active" : "inactive",
                  }}
                />
              ))}
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-muted rounded-md disabled:opacity-50 hover:bg-muted/80 transition text-sm font-medium"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-muted rounded-md disabled:opacity-50 hover:bg-muted/80 transition text-sm font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
