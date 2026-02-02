'use client';

import { motion } from 'framer-motion';

interface ComparisonRow {
  feature: string;
  afterhours: string | React.ReactNode;
  legacy: string | React.ReactNode;
}

interface ComparisonTableProps {
  className?: string;
}

export default function ComparisonTable({ className = '' }: ComparisonTableProps) {
  const rows: ComparisonRow[] = [
    {
      feature: 'Pricing Model',
      afterhours: <span className="font-semibold text-primary">Flat rate</span>,
      legacy: <span className="text-muted-foreground">Per-minute fees</span>,
    },
    {
      feature: 'Hold Time',
      afterhours: <span className="font-semibold text-primary">0s</span>,
      legacy: <span className="text-muted-foreground">15-30s average</span>,
    },
    {
      feature: 'Answer Speed',
      afterhours: <span className="font-semibold text-primary">&lt;1 second</span>,
      legacy: <span className="text-muted-foreground">Variable, human-dependent</span>,
    },
    {
      feature: 'Emergency Triage',
      afterhours: <span className="font-semibold text-primary">Intelligent instant detection</span>,
      legacy: <span className="text-muted-foreground">Manual, human error risk</span>,
    },
    {
      feature: 'CRM Integration',
      afterhours: <span className="font-semibold text-primary">Secure CRM Sync</span>,
      legacy: <span className="text-muted-foreground">Manual data entry required</span>,
    },
    {
      feature: 'Spam Filtering',
      afterhours: <span className="font-semibold text-primary">Automatic robocall blocking</span>,
      legacy: <span className="text-muted-foreground">You pay for spam calls</span>,
    },
    {
      feature: 'Availability',
      afterhours: <span className="font-semibold text-primary">24/7, never sleeps</span>,
      legacy: <span className="text-muted-foreground">Limited hours, breaks</span>,
    },
    {
      feature: 'Scalability',
      afterhours: <span className="font-semibold text-primary">Handles unlimited concurrent calls</span>,
      legacy: <span className="text-muted-foreground">Limited by human operators</span>,
    },
  ];

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-border/50 rounded-xl bg-card/40 backdrop-blur-xl">
          <table className="min-w-full divide-y divide-border/50">
            <thead>
              <tr className="bg-muted/30">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-sm font-semibold text-primary"
                >
                  Afterhours
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground"
                >
                  Legacy Services
                  <span className="block text-xs font-normal mt-1">
                    (Ruby/Smith.ai)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  className="hover:bg-muted/20 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {row.afterhours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {row.legacy}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
