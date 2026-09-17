import type {ReactNode} from 'react';
import {families, familyById, type Family} from '@site/src/data/families';
import {links, playgroundLinkMode} from '@site/src/links';

// Every playground link on the site goes through these components, so the docs never carry a literal
// host. A pre-release family links to its preview (staging) deploy; once its `released` flag in
// src/data/families.ts is true, the same pages link to the production deploy with no page edits.
export type DemoId = keyof typeof links.demos;

const meta: Record<DemoId, {family: Family['id']; name: string; body: string}> = {
  interactions: {family: 'interactions', name: 'Interaction playground', body: 'Seven stations from one descriptor: push button, gaze dwell, wall and table levers, dial, pulley, scoop and toss.'},
  environment: {family: 'environment', name: 'Environment playground', body: 'Preset transitions, a passthrough toggle that restores the sky exactly, live bus and master sliders.'},
  uiShowcase: {family: 'uiextensions', name: 'UI Extensions showcase', body: 'Six windows and two dock regions: registration form, event log, hand menu, gallery, player status.'},
  uiLab: {family: 'uiextensions', name: 'Multiplatform lab', body: 'The same scene through the IWSDK, XR Blocks and desktop pipelines, picked from a launch screen.'},
};

export function demoHosts(demo: DemoId): {live: string; preview: string; current: string; released: boolean; useLive: boolean; family: Family} {
  const hosts = links.demos[demo];
  const family = familyById(meta[demo].family);
  const useLive = playgroundLinkMode === 'live' || family.released;
  return {...hosts, current: useLive ? hosts.live : hosts.preview, released: family.released, useLive, family};
}

const hostOf = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// A link to the playground that is right for the family's status today. With no children it prints the
// host it links to, so a page never states a URL that can go stale.
export function DemoLink({demo, path = '', children}: {demo: DemoId; path?: string; children?: ReactNode}): ReactNode {
  const {current, useLive} = demoHosts(demo);
  const href = current + path;
  return (
    <a href={href}>
      {children ?? <code>{hostOf(current) + path}</code>}
      {useLive ? null : <span title="Preview build of the development branch. The production host goes live with the family's first stable release."> (preview)</span>}
    </a>
  );
}

// Both hosts side by side, for pages that explain where a demo lives.
export function DemoHosts({demo}: {demo: DemoId}): ReactNode {
  const {live, preview, released} = demoHosts(demo);
  const previewLink = links.demos[demo].previewServes ? <a href={preview}><code>{hostOf(preview)}</code></a> : <><code>{hostOf(preview)}</code> (not yet serving)</>;
  return (
    <>
      Preview: {previewLink}. Live: <a href={live}><code>{hostOf(live)}</code></a>
      {released ? '.' : ' (active once the family has a stable release).'}
    </>
  );
}

// The table of every playground with both hosts and the family's status.
export function PlaygroundTable(): ReactNode {
  return (
    <table>
      <thead>
        <tr>
          <th>Demo</th>
          <th>Family</th>
          <th>Preview build</th>
          <th>Live</th>
          <th>What it shows</th>
        </tr>
      </thead>
      <tbody>
        {(Object.keys(meta) as DemoId[]).map((id) => {
          const {live, preview, released, family} = demoHosts(id);
          return (
            <tr key={id}>
              <td>{meta[id].name}</td>
              <td>
                <a href={`/webxr/${family.id}`}>{family.name}</a>
              </td>
              <td>
                {links.demos[id].previewServes ? (
                  <a href={preview}>
                    <code>{hostOf(preview)}</code>
                  </a>
                ) : (
                  <span title="The staging project does not yet serve at its root; see the repository's CI for the deploy branch.">
                    <code>{hostOf(preview)}</code> (not yet serving)
                  </span>
                )}
              </td>
              <td>
                <a href={live}>
                  <code>{hostOf(live)}</code>
                </a>
                {released ? null : ' (active once released)'}
              </td>
              <td>{meta[id].body}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// One sentence summarising the status rule, for the top of a demo list.
export function PlaygroundNote(): ReactNode {
  const pending = families.filter((f) => !f.released && f.demo).map((f) => f.name);
  if (pending.length === 0) {
    return <p>Every playground links to its production deploy.</p>;
  }
  if (playgroundLinkMode === 'live') {
    return (
      <p>
        Links across the site open the live hosts. {pending.join(', ')} {pending.length === 1 ? 'is' : 'are'} still pre-release,
        so a live host is active only once that family has its first stable release; until then the preview build column is
        the one that runs.
      </p>
    );
  }
  return (
    <p>
      {pending.join(', ')} {pending.length === 1 ? 'is' : 'are'} pre-release, so their links open the preview build of the
      development branch. The live hosts become active with each family&apos;s first stable release, and these pages switch
      to them automatically.
    </p>
  );
}
