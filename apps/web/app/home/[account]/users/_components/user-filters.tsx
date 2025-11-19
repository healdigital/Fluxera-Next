'use client';

import { useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Search } from 'lucide-react';

import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      params.delete('page');

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      updateFilters('search', value);
    },
    [updateFilters],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      updateFilters('role', value);
    },
    [updateFilters],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      updateFilters('status', value);
    },
    [updateFilters],
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name or email..."
            defaultValue={searchParams.get('search') ?? ''}
            onChange={handleSearchChange}
            className="pl-9"
            data-test="user-search-input"
          />
        </div>
      </div>

      <div className="w-full sm:w-48">
        <Label htmlFor="role">Role</Label>
        <Select
          value={searchParams.get('role') ?? 'all'}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger id="role" data-test="role-filter">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-48">
        <Label htmlFor="status">Status</Label>
        <Select
          value={searchParams.get('status') ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status" data-test="status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending_invitation">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
