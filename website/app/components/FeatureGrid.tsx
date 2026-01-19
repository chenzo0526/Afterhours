const features = [
  {
    title: 'Late-night call answering',
    description: "We answer calls when you're closed.",
  },
  {
    title: 'Urgency qualification',
    description: 'We assess urgency from the caller.',
  },
  {
    title: 'Detail capture',
    description: 'We capture the issue, address, and callback preference when shared.',
  },
  {
    title: 'On-call alerts',
    description: 'Urgent calls trigger an on-call notification.',
  },
  {
    title: 'Morning report',
    description: 'Everything else lands in a clean morning report.',
  },
  {
    title: 'Spam / wrong-number filtering',
    description: 'Flags likely spam and wrong numbers when possible.',
  },
  {
    title: 'Business hours rules',
    description: 'Configurable rules for different handling during business hours.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Core coverage features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The essentials for late-night call coverage.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
