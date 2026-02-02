type SignalWaveProps = {
  intensity: "low" | "medium" | "high";
  className?: string;
  split?: boolean;
};

const intensityMap = {
  low: { stroke: "rgba(148, 163, 184, 0.5)", opacity: 0.6 },
  medium: { stroke: "rgba(56, 189, 248, 0.6)", opacity: 0.8 },
  high: { stroke: "rgba(125, 211, 252, 0.8)", opacity: 1 },
};

export default function SignalWave({ intensity, className, split = false }: SignalWaveProps) {
  const { stroke, opacity } = intensityMap[intensity];

  return (
    <div className={className}>
      <svg
        viewBox="0 0 640 120"
        role="img"
        aria-label="Live intake system signal waveform showing active emergency call handling for service trades"
        className="h-12 w-full"
      >
        {split ? (
          <>
            <path
              d="M0 60 C 60 20, 120 20, 180 60 C 240 100, 300 100, 320 60"
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={opacity}
            />
            <path
              d="M360 60 C 420 20, 480 20, 540 60 C 600 100, 640 100, 680 60"
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={opacity}
            />
          </>
        ) : (
          <path
            d="M0 60 C 60 20, 120 20, 180 60 C 240 100, 300 100, 360 60 C 420 20, 480 20, 540 60 C 600 100, 640 100, 680 60"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={opacity}
          />
        )}
        <path
          d="M0 60 C 80 40, 160 40, 240 60 C 320 80, 400 80, 480 60 C 560 40, 640 40, 720 60"
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.7}
        />
      </svg>
    </div>
  );
}
