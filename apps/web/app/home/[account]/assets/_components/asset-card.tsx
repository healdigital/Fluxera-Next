'use client';

import { useRouter } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';

interface AssetCardProps {
  asset: AssetWithUser;
  accountSlug: string;
}

export function AssetCard({ asset, accountSlug }: AssetCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/home/${accountSlug}/assets/${asset.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Generate optimized image URL if image exists
  const getOptimizedImageUrl = (url: string | null) => {
    if (!url) return null;
    // Use Next.js Image optimization or our custom endpoint
    return `/api/images/optimize?url=${encodeURIComponent(url)}&w=400&h=300&q=80&f=webp`;
  };

  const optimizedImageUrl = getOptimizedImageUrl(asset.image_url);

  return (
    <Card
      className="hover:bg-muted/50 focus-within:ring-ring cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${asset.name}`}
      data-test={`asset-card-${asset.id}`}
    >
      {optimizedImageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={optimizedImageUrl}
            alt={asset.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{asset.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <CategoryBadge category={asset.category} />
          <StatusBadge status={asset.status} />
        </div>

        <div className="flex items-center gap-2 text-sm">
          {asset.assigned_user ? (
            <>
              {asset.assigned_user.picture_url && (
                <img
                  src={asset.assigned_user.picture_url}
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="text-muted-foreground">
                Assigned to{' '}
                <span className="text-foreground font-medium">
                  {asset.assigned_user.name}
                </span>
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: AssetWithUser['category'] }) {
  const categoryLabels: Record<AssetWithUser['category'], string> = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    mobile_phone: 'Mobile Phone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    printer: 'Printer',
    other_equipment: 'Other Equipment',
  };

  return (
    <Badge
      variant="outline"
      className="font-normal"
      aria-label={`Category: ${categoryLabels[category]}`}
    >
      {categoryLabels[category]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AssetWithUser['status'] }) {
  const statusConfig: Record<
    AssetWithUser['status'],
    { label: string; className: string }
  > = {
    available: {
      label: 'Available',
      className:
        'text-green-800 border-green-700 bg-green-50 dark:text-green-300 dark:border-green-600 dark:bg-green-950',
    },
    assigned: {
      label: 'Assigned',
      className:
        'text-blue-800 border-blue-700 bg-blue-50 dark:text-blue-300 dark:border-blue-600 dark:bg-blue-950',
    },
    in_maintenance: {
      label: 'In Maintenance',
      className:
        'text-orange-800 border-orange-700 bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:bg-orange-950',
    },
    retired: {
      label: 'Retired',
      className:
        'text-gray-800 border-gray-700 bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-950',
    },
    lost: {
      label: 'Lost',
      className:
        'text-red-800 border-red-700 bg-red-50 dark:text-red-300 dark:border-red-600 dark:bg-red-950',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`font-normal ${config.className}`}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
