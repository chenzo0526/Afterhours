import Link from 'next/link';

export default function Hero() {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Stop losing emergency calls while you're asleep.
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/start#start-trial"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors w-full sm:w-auto"
          >
            Start Live Trial
          </Link>
          <Link
            href="/pricing"
            className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            See Pricing
          </Link>
        </div>
        <div className="mt-16">
          <p className="text-sm text-gray-500 mb-6">Built for local service teams</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
