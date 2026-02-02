import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-semibold mb-4">Industry Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The industry page you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/industries/plumbers">View Plumbers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
