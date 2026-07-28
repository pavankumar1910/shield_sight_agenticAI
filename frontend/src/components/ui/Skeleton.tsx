import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
};

// Pre-built skeleton components
export const SkeletonCard = () => (
  <div className="glass rounded-lg p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="glass rounded-lg p-6 space-y-4">
    <Skeleton className="h-6 w-1/4 mb-6" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="glass rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);