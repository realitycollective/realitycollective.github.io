import type {ReactNode} from 'react';
import {demoShots, type DemoShot} from '@site/src/data/demoShots';
import styles from './styles.module.css';

// A rolling strip of playground screenshots, right to left, looping without a seam. The track holds the set
// twice and the animation moves it exactly half its width, so the second copy takes over where the first
// ends. Pure CSS: it pauses on hover and focus, and under prefers-reduced-motion it stands still and scrolls
// by hand instead. The second copy is hidden from assistive technology so nothing is announced twice.
function Tile({shot, hidden}: {shot: DemoShot; hidden?: boolean}): ReactNode {
  return (
    <li className={styles.tile} aria-hidden={hidden ? 'true' : undefined}>
      <a href={shot.href} tabIndex={hidden ? -1 : undefined} title={shot.caption}>
        <img src={shot.src} alt={hidden ? '' : shot.alt} width={640} height={360} loading="lazy" decoding="async" />
        <span className={styles.caption}>{shot.caption}</span>
      </a>
    </li>
  );
}

export default function DemoCarousel(): ReactNode {
  return (
    <section className={styles.carousel} aria-label="Screenshots of the live playgrounds">
      <ul className={styles.track} style={{['--tiles' as string]: demoShots.length}}>
        {demoShots.map((shot) => (
          <Tile key={shot.src} shot={shot} />
        ))}
        {demoShots.map((shot) => (
          <Tile key={`${shot.src}-copy`} shot={shot} hidden />
        ))}
      </ul>
    </section>
  );
}
