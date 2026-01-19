import Link from 'next/link';

const tiers = [
  {
    name: 'Starter',
    description: 'Best for solo operators',
    price: '$99',
    features: [
      'Late-night call answering',
      'SMS + email summaries',
      'Spam filtering',
      'Basic urgency tagging',
      'Business hours rules',
      'Call recording',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    description: 'Best for small teams',
    price: '$249',
    features: [
      'Higher monthly call volume',
      'Advanced summaries (job type, urgency, callback window)',
      'Multi-contact notifications',
      'Custom notification rules',
      'Call recording',
      'Priority support',
    ],
  },
  {
    name: 'Scale',
    description: 'Multi-location businesses',
    price: 'Custom',
    features: [
      'Unlimited or pooled call volume',
      'Multi-location setup',
      'Custom intake prompts per location',
      'Advanced notification rules (when configured)',
      'Optional weekly digest available',
      'Dedicated onboarding & support',
    ],
  },
];

const addOns = [
  {
    name: 'Additional call minutes',
    description: 'Per-minute pricing for calls beyond your plan',
  },
  {
    name: 'Additional trades/locations',
    description: 'Add more service types or locations to your account',
  },
];

export default function PricingTable() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your call volume. All plans include core features.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`p-8 rounded-lg border-2 ${
                index === 1
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-gray-600 mb-4">{tier.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                {tier.price !== 'Custom' && (
                  <span className="text-gray-600">/month</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-900 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/start#start-trial"
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                  index === 1
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Start Live Trial
              </Link>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {addOns.map((addOn, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{addOn.name}</h4>
                <p className="text-sm text-gray-600">{addOn.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> SMS notifications require 10DLC registration for carrier compliance.
              SMS throughput depends on your registration status with carriers. We'll help you get set up.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
