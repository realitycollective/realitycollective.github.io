import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// The brand sunset: navy at the top through the logo's magenta and red into gold at the horizon, a gold
// perspective grid, and optionally the Reality Collective globe as the setting sun. Used by the homepage
// and the WebXR page. Colours are the brand table in the design plan; the shapes are inline SVG so the
// hero scales without an image.
type Props = {
  children: ReactNode;
  globe?: boolean;
  className?: string;
};

const HORIZON = 62; // percent of the hero height where the grid vanishes

function gridLines(): ReactNode {
  const lines: ReactNode[] = [];
  for (let i = 0; i <= 8; i += 1) {
    const x = i * 180;
    lines.push(
      <line key={`v${i}`} x1={x} y1={100} x2={720 + (x - 720) * 0.35} y2={HORIZON} vectorEffect="non-scaling-stroke" />,
    );
  }
  for (const f of [0.68, 0.76, 0.86, 1]) {
    lines.push(<line key={`h${f}`} x1={0} y1={f * 100} x2={1440} y2={f * 100} vectorEffect="non-scaling-stroke" />);
  }
  return lines;
}

export default function SunsetHero({children, globe = false, className}: Props): ReactNode {
  return (
    <section className={clsx(styles.hero, className)}>
      <svg className={styles.sky} viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--rc-navy)" />
            <stop offset="0.45" stopColor="#5a0c46" />
            <stop offset="0.72" stopColor="var(--rc-magenta)" />
            <stop offset="0.9" stopColor="var(--rc-action)" />
            <stop offset="1" stopColor="var(--rc-gold)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="100" fill="url(#rc-sky)" />
        <g stroke="var(--rc-gold)" strokeOpacity="0.45" strokeWidth="2">
          {gridLines()}
        </g>
      </svg>
      {globe && (
        <svg className={styles.globe} viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <linearGradient id="rc-sun" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--rc-action)" />
              <stop offset="1" stopColor="var(--rc-magenta)" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="160" r="150" fill="url(#rc-sun)" />
          <g fill="none" stroke="#ffffff" strokeWidth="3">
            <circle cx="160" cy="160" r="150" />
            <ellipse cx="160" cy="160" rx="60" ry="150" />
            <ellipse cx="160" cy="160" rx="115" ry="150" />
            <line x1="10" y1="160" x2="310" y2="160" />
          </g>
        </svg>
      )}
      <div className={styles.content}>{children}</div>
    </section>
  );
}
