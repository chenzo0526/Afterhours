const steps = [
  {
    number: '1',
    title: 'Caller calls your number',
    description: 'Customer dials your business number, even after hours.',
  },
  {
    number: '2',
    title: 'Afterhours qualifies + captures job details',
    description: 'Afterhours takes calls when forwarded, asks a few questions, and captures the essential details shared.',
  },
  {
    number: '3',
    title: 'Summary sent to on-call tech',
    description: 'Your on-call contact receives a summary with the details captured from the call. No dispatch or arrival times are promised.',
  },
];

export default function Steps() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, calm intake in three steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 text-white text-2xl font-bold mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
