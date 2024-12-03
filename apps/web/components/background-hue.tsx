const DEFAULT_COLORS_SCALE = {
  0: '#7d5aa6',
  1: '#533a75',
  2: '#4b3565',
};

export function BackgroundHue({
  className,
  opacity = 0.1,
  colorsScale = DEFAULT_COLORS_SCALE,
}: {
  className?: string;
  opacity?: number;
  colorsScale?: Record<number, string>;
}) {
  const colors = Object.values(colorsScale).map((color, index, array) => {
    const offset = `${(index / (array.length - 1)) * 100}%`;
    const stopOpacity = 1 - index / (array.length - 1);

    return (
      <stop
        key={index}
        offset={offset}
        style={{ stopColor: color, stopOpacity }}
      />
    );
  });

  return (
    <svg
      className={`pointer-events-none fixed left-0 top-0 hidden h-full w-full dark:block !m-0 ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="purpleGradient"
          x1="10%"
          y1="50%"
          x2="90%"
          y2="30%"
          gradientUnits="userSpaceOnUse"
        >
          {colors}
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#purpleGradient)" />
    </svg>
  );
}
