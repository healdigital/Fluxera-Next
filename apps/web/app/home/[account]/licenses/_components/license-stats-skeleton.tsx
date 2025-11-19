import { Card, CardContent } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

export function LicenseStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
