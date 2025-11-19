'use client';

import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';

interface BackToLicensesButtonProps {
  accountSlug: string;
}

export function BackToLicensesButton({
  accountSlug,
}: BackToLicensesButtonProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="mb-4"
      data-test="back-to-licenses-button"
    >
      <Link
        href={`/home/${accountSlug}/licenses`}
        aria-label="Back to licenses list"
      >
        <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to Licenses
      </Link>
    </Button>
  );
}
