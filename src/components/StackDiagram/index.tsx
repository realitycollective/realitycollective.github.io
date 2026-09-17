import type {ReactNode} from 'react';

// The layering rule as a diagram: your app, one adapter, the engine-free core, the shared contracts.
// Arrows only point down. Colours are fixed to the dark palette because the diagram sits on dark bands.
export type Layer = {title: string; sub: string};

type Props = {
  app: Layer;
  adapter: Layer;
  core: Layer;
  contracts?: Layer;
  caption?: string;
};

const panel = '#1c2030';
const border = '#3a3f4d';
const line = '#5b6172';
const text = '#ffffff';
const muted = '#b7bcc8';
const faint = '#8e94a3';
const action = '#fc3848';

export default function StackDiagram({app, adapter, core, contracts, caption}: Props): ReactNode {
  const layers: Array<Layer & {accent?: boolean}> = [app, adapter, {...core, accent: true}];
  if (contracts) {
    layers.push(contracts);
  }
  const step = 94;
  const height = layers.length * step + (caption ? 34 : 0);
  return (
    <svg
      viewBox={`0 0 420 ${height}`}
      role="img"
      aria-label="The layering rule: your app, one adapter, the engine-free core, the shared contracts"
      style={{display: 'block', width: '100%', maxWidth: 420, height: 'auto'}}
      fontFamily="IBM Plex Sans, Segoe UI, system-ui, sans-serif">
      <defs>
        <marker id="rc-stack-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={line} />
        </marker>
      </defs>
      {layers.map((l, i) => {
        const y = i * step + 8;
        return (
          <g key={l.title}>
            <rect x="20" y={y} width="380" height="64" rx="10" fill={panel} stroke={l.accent ? action : border} strokeWidth={l.accent ? 2 : 1} />
            <text x="210" y={y + 28} textAnchor="middle" fill={text} fontSize="17" fontWeight="600">
              {l.title}
            </text>
            <text x="210" y={y + 50} textAnchor="middle" fill={muted} fontSize="13">
              {l.sub}
            </text>
            {i < layers.length - 1 && <path d={`M210 ${y + 64} V ${y + 86}`} stroke={line} strokeWidth="2" markerEnd="url(#rc-stack-arrow)" />}
          </g>
        );
      })}
      {caption && (
        <text x="210" y={height - 8} textAnchor="middle" fill={faint} fontSize="13">
          {caption}
        </text>
      )}
    </svg>
  );
}
