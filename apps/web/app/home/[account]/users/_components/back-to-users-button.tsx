'use client';

import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';

interface BackToUsersButtonProps {
  accountSlug: string;
}

export function BackToUsersButton({ accountSlug }: BackToUsersButtonProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="mb-4"
      data-test="back-to-users-button"
    >
      <Link href={`/home/${accountSlug}/users`} aria-label="Back to users list">
        <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to Users
      </Link>
    </Button>
  );
}
