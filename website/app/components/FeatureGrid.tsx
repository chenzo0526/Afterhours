const features = [
  {
    title: 'After-hours call intake',
    description: 'Handles after-hours and overflow calls that you forward.',
  },
  {
    title: 'Urgency tagging',
    description: "Captures urgency based on the caller's description.",
  },
  {
    title: 'Caller info capture',
    description: 'Captures the details provided (name, address, issue, urgency).',
  },
  {
    title: 'Text notifications',
    description: 'Sends summaries to your on-call contact with the details you choose (carrier delivery applies).',
  },
  {
    title: 'Call summaries',
    description: 'Get a call summary record plus a notification attempt record for each handled call.',
  },
  {
    title: 'Spam / wrong-number filtering',
    description: 'Flags likely spam and wrong numbers when possible.',
  },
  {
    title: 'Business hours rules',
    description: 'Configurable rules for different handling during business hours.',
  },
  {
    title: 'Optional handoff request',
    description: 'If enabled, callers can request a handoff to your team when you are available.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Core Coverage Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The essentials for calm, reliable after-hours intake.
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
