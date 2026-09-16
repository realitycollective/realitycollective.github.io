import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SunsetHero from '@site/src/components/SunsetHero';
import StackDiagram from '@site/src/components/StackDiagram';
import {demoUrl, families, familyById} from '@site/src/data/families';
import {playgroundLinkMode} from '@site/src/links';
import {links} from '@site/src/links';
import styles from './index.module.css';

const engines = ['three.js', 'raw WebXR', 'Babylon.js', 'Meta IWSDK', 'Google XR Blocks'];

const steps = [
  {
    title: 'Pick your engine',
    body: 'three.js and raw WebXR, Babylon.js, Meta IWSDK or Google XR Blocks. The engine you already use.',
  },
  {
    title: 'Install one adapter per family',
    body: 'The adapter depends on its core, and on the shared input contracts where the family uses them, so npm installs those with it. It also re-exports them, so your app imports everything from the one package.',
    code: 'npm install @realitycollective/threejs-interactions@preview',
  },
  {
    title: 'Run the playground',
    body: 'Every family ships a deployed demo. Open it on a headset, or on a desktop with the mouse fallback.',
  },
];

const pick = (id: 'interactions' | 'environment' | 'uiextensions', demo: {live: string; preview: string}) =>
  playgroundLinkMode === 'live' || familyById(id).released ? demo.live : demo.preview;

const playgrounds = [
  {name: 'Interaction playground', fam: 'Interactions', released: familyById('interactions').released, href: pick('interactions', links.demos.interactions), body: 'Seven stations from one descriptor: push button, gaze dwell, wall and table levers, dial, pulley, scoop and toss.'},
  {name: 'Environment playground', fam: 'Environment', released: familyById('environment').released, href: pick('environment', links.demos.environment), body: 'Preset transitions, a passthrough toggle that restores the sky exactly, live bus and master sliders.'},
  {name: 'UI Extensions showcase', fam: 'UI Extensions', released: familyById('uiextensions').released, href: pick('uiextensions', links.demos.uiShowcase), body: 'Six windows and two dock regions: registration form, event log, hand menu, gallery, player status.'},
  {name: 'Multiplatform lab', fam: 'UI Extensions', released: familyById('uiextensions').released, href: pick('uiextensions', links.demos.uiLab), body: 'The same scene through the IWSDK, XR Blocks and desktop pipelines, picked from a launch screen.'},
];

const howBlocks: Array<[string, string]> = [
  ['Your app', 'Owns the content: meshes, panels, placement, physics and sound files. Installs one adapter per family and wires families together with subscriptions, in the one place where both halves are in scope.'],
  ['One adapter per engine', 'The only place an engine name appears. It reads the engine each frame, feeds the core and applies the results back. It depends on the core, so npm installs it, and re-exports it, so you import from one package.'],
  ['The engine-free core', 'All the logic as plain TypeScript with no engine import. An architecture test fails the build the moment one lands. That is what lets a behaviour, a window or an environment run unchanged on every engine, and be tested without a headset.'],
  ['Shared contracts', 'One description of input, poses and pointers, published from its own repository with zero dependencies. An adapter written once feeds both the Interactions and UI Extensions families.'],
  ['Capabilities that report', 'What an engine cannot do is reported, never silent. A behaviour switches itself off and says why; a sensor answers unsupported, unavailable, pending or active.'],
  ['Families never reference each other', 'Not a runtime import, not a type. What crosses a boundary is a subscription your app makes, such as playing an Environment cue when an Interactions press fires.'],
];

export default function WebXRHome(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const hasApiDocs = Boolean(siteConfig.customFields?.hasApiDocs);

  return (
    <Layout
      title="Reality Toolkit WebXR"
      description="Engine-free input, interactions, spatial UI and environment for the immersive web. One adapter per engine, the rest is yours.">
      <main className={`rc-dark-nav ${styles.page}`}>
        <SunsetHero>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.kicker}>Reality Toolkit</span>
              <h1 className={styles.title}>WebXR</h1>
              <span className={styles.pill}>put the web in your face</span>
              <p className={styles.lead}>
                Engine-free input, interactions, spatial UI and environment for the immersive web. One adapter per engine,
                the rest is yours.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primary} to="/webxr/docs">
                  Get started
                </Link>
                <a className={styles.secondary} href="#playgrounds">
                  Live playgrounds
                </a>
              </div>
            </div>
            <div className={styles.lineup}>
              <span className={styles.lineupEyebrow}>Now playing · four families</span>
              {families.map((f) => (
                <Link key={f.id} to={`/webxr/${f.id}`} className={styles.lineupRow}>
                  <span className={styles.lineupNumber}>{f.number}</span>
                  <span className={styles.lineupText}>
                    <span className={styles.lineupName}>{f.name}</span>
                    <span className={styles.lineupBody}>{f.tagline}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </SunsetHero>

        <section className={styles.engineStrip}>
          {engines.map((e) => (
            <span key={e} className={styles.engineChip}>
              {e}
            </span>
          ))}
        </section>

        <section className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.title} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <h2 className={styles.stepTitle}>{s.title}</h2>
              <p className={styles.stepBody}>{s.body}</p>
              {s.code && <code className={styles.code}>{s.code}</code>}
            </div>
          ))}
        </section>

        <section className={styles.howSection}>
          <div className={styles.howHead}>
            <h2 className={styles.heading}>How it is built</h2>
            <p className={styles.sectionLead}>
              Every family has the same shape, and the shape is the whole idea. The logic lives in an engine-free core that
              carries the tests. A thin adapter, one per engine, binds that core to three.js, Babylon.js, Meta IWSDK or Google
              XR Blocks. Your app installs one adapter per family and never touches the engine&apos;s input, UI or
              environment systems directly again.
            </p>
          </div>
          <div className={styles.howGrid}>
            <div className={styles.howBlocks}>
              {howBlocks.map(([title, body]) => (
                <div key={title} className={styles.howBlock}>
                  <h3 className={styles.howTitle}>{title}</h3>
                  <p className={styles.familyBody}>{body}</p>
                </div>
              ))}
            </div>
            <div className={styles.howArt}>
              <StackDiagram
                app={{title: 'Your app', sub: 'content, physics, the wiring between families'}}
                adapter={{title: 'One adapter', sub: 'three.js · Babylon.js · IWSDK · XR Blocks'}}
                core={{title: 'Engine-free core', sub: 'interactions · ui extensions · environment'}}
                contracts={{title: 'Contracts', sub: '@realitycollective/webxr-input · zero dependencies'}}
                caption="Arrows only point down."
              />
              <Link to="/webxr/docs/concepts/layering-rule" className={styles.howLink}>
                Read the layering rule →
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.familiesSection}>
          <h2 className={styles.heading}>The families</h2>
          <div className={styles.families}>
            {families.map((f) => (
              <div key={f.id} className={styles.family}>
                <div className={styles.familyHead}>
                  <span className={styles.eyebrow}>Family {f.number}</span>
                  <span className={f.cardStatus === 'Released' ? styles.statusReleased : styles.statusPreview}>{f.cardStatus}</span>
                </div>
                <h3 className={styles.familyTitle}>{f.name}</h3>
                <p className={styles.familyBody}>{f.cardBody}</p>
                <code className={styles.code}>@realitycollective/{f.core.pkg}</code>
                <p className={styles.familyAdapters}>{f.cardAdapters}</p>
                <div className={styles.familyLinks}>
                  <Link to={`/webxr/${f.id}`}>Overview →</Link>
                  <Link to={`/webxr/docs/${f.id}/get-started`}>Docs</Link>
                  {hasApiDocs && <Link to={`/webxr/api/${f.id}`}>API</Link>}
                  {f.demo && <a href={demoUrl(f)}>{playgroundLinkMode === 'live' || f.released ? 'Live demo' : 'Preview demo'}</a>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="playgrounds" className={styles.playgroundsSection}>
          <h2 className={styles.heading}>Put it on a headset</h2>
          <p className={styles.sectionLead}>
            These are the live hosts, deployed from each repository&apos;s main branch. A pre-release family&apos;s host becomes
            active with its first stable release; the preview builds are listed on the Start here page. Open one on a
            headset, or on a desktop with the mouse fallback, then come back for how it is built.
          </p>
          <div className={styles.playgrounds}>
            {playgrounds.map((p) => (
              <a key={p.name} href={p.href} className={styles.playground}>
                <span className={styles.eyebrow}>{p.fam}</span>
                <h3 className={styles.playgroundTitle}>{p.name}</h3>
                <p className={styles.familyBody}>{p.body}</p>
                <span className={styles.playgroundUrl}>{p.href.replace('https://', '')} → {playgroundLinkMode === 'live' || p.released ? '' : '(preview build)'}</span>
              </a>
            ))}
          </div>
          <p className={styles.note}>
            The Service Framework for the web is the fifth member of the estate and keeps its own site:{' '}
            <a href={links.serviceFramework}>serviceframework.realitycollective.net</a>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
