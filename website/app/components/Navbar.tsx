import Link from 'next/link';
import StartTrialButton from '@/components/StartTrialButton';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/start" className="flex items-center text-lg font-semibold text-gray-900 tracking-tight">
            Afterhours
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pricing" className="text-gray-700 hover:text-gray-900 font-medium">
              Pricing
            </Link>
            <StartTrialButton className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Start Live Trial
            </StartTrialButton>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Pricing
            </Link>
            <StartTrialButton className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium">
              Start Live Trial
            </StartTrialButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
