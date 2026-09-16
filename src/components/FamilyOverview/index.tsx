import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import StackDiagram from '@site/src/components/StackDiagram';
import {demoLabel, demoUrl, families, type Family} from '@site/src/data/families';
import styles from './styles.module.css';

// The family overview page, shaped like the Service Framework overview: a dark band saying what the
// family is, how it is built (the layering rule with this family's names in it), where it sits among
// the four families, why you would use it, which adapter to pick, then a closing dark band with the
// core-versus-adapter ladder, the glossary and the next steps. One component renders all four families.
export default function FamilyOverview({family}: {family: Family}): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const hasApiDocs = Boolean(siteConfig.customFields?.hasApiDocs);
  const docs = `/webxr/docs/${family.id}`;

  const next: Array<{label: string; body: string; to: string}> = [
    {label: `Welcome to WebXR ${family.name}`, body: 'Requirements, packages, use cases and a quickstart on one page.', to: `${docs}/get-started`},
    {label: 'Basics', body: 'The concepts, one page per topic, in the same order as the Service Framework basics.', to: `${docs}/basics`},
    {label: 'Features', body: 'The additional capabilities that ship with the family, and the design decisions behind it.', to: `${docs}/features`},
    {label: 'Host integrations', body: 'One page per package: the core and the adapter for each engine, with what it cannot do and why.', to: `${docs}/integrations`},
    {label: 'Examples', body: 'The shipped demos and examples, broken down piece by piece.', to: `${docs}/examples`},
  ];
  if (hasApiDocs) {
    next.push({label: 'API reference', body: 'Generated from the TSDoc in every package of the family.', to: `/webxr/api/${family.id}`});
  }

  return (
    <Layout title={`${family.name}: Reality Toolkit WebXR`} description={family.tagline}>
      <main className={`rc-dark-nav ${styles.page}`}>
        <section className={styles.band}>
          <div className={styles.introGrid}>
            <div className={styles.introCopy}>
              <span className={styles.eyebrowAccent}>
                Family {family.number} · {family.name}
              </span>
              <h1 className={styles.title}>{family.headline}</h1>
              <p className={styles.leadDark}>{family.lead}</p>
              <div className={styles.chips}>
                {family.chips.map((c) => (
                  <span key={c} className={styles.chip}>
                    {c}
                  </span>
                ))}
              </div>
              <div className={styles.actions}>
                <Link className={styles.primary} to={`${docs}/get-started`}>
                  Get started
                </Link>
                {family.demo ? (
                  <a className={styles.secondary} href={demoUrl(family)}>
                    {demoLabel(family)}
                  </a>
                ) : (
                  <a className={styles.secondary} href={family.repo}>
                    GitHub
                  </a>
                )}
              </div>
            </div>
            <div className={styles.map}>
              <div className={styles.mapRoot}>
                <div className={styles.mapTitle}>{family.core.pkg}</div>
                <div className={styles.mapSub}>{family.core.sub}</div>
              </div>
              {family.mapItems.map((item) => (
                <div key={item.pkg} className={styles.mapLeaf}>
                  <div className={styles.mapTitleSmall}>{item.pkg}</div>
                  <div className={styles.mapSubSmall}>{item.sub}</div>
                </div>
              ))}
              {family.mapFoot && (
                <div className={styles.mapFoot}>
                  <div className={styles.mapTitleSmall}>{family.mapFoot.pkg}</div>
                  <div className={styles.mapSubSmall}>{family.mapFoot.sub}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.heading}>How it is built</h2>
            <p className={styles.lead}>
              Every Reality Toolkit WebXR family has the same shape. The logic lives in an engine-free core that carries the
              tests. A thin adapter binds that core to one engine, depends on it, and re-exports it, so your app installs one
              package. Where families need to agree on a shape, they share plain contracts rather than importing each other.
            </p>
            <div className={styles.howGrid}>
              <div className={styles.howCopy}>
                <div className={styles.howBlock}>
                  <h3 className={styles.howTitle}>Your app</h3>
                  <p className={styles.body}>
                    Owns the content: meshes, panels, placement, physics and sound files. Installs one adapter per family and
                    wires families together with subscriptions in the one place where both halves are in scope.
                  </p>
                </div>
                <div className={styles.howBlock}>
                  <h3 className={styles.howTitle}>One adapter per engine</h3>
                  <p className={styles.body}>
                    The only place an engine name appears. It reads the engine each frame, feeds the core, applies the
                    core&apos;s results back, and reports anything the engine cannot do instead of failing silently.
                  </p>
                </div>
                <div className={styles.howBlock}>
                  <h3 className={styles.howTitle}>The engine-free core</h3>
                  <p className={styles.body}>
                    All the logic, as plain TypeScript with no engine import. An architecture test fails the build the moment
                    one lands, which is what lets the same behaviour run unchanged on every engine, and be tested without a
                    headset.
                  </p>
                </div>
                {family.stack.contracts && (
                  <div className={styles.howBlock}>
                    <h3 className={styles.howTitle}>Shared contracts</h3>
                    <p className={styles.body}>
                      One description of input, poses and pointers, published from its own repository with zero dependencies,
                      so an adapter written once feeds both the Interactions and UI Extensions families.
                    </p>
                  </div>
                )}
              </div>
              <div className={styles.howArt}>
                <StackDiagram
                  app={{title: 'Your app', sub: 'content, physics, the wiring between families'}}
                  adapter={{title: 'One adapter', sub: family.stack.adapter}}
                  core={{title: 'Engine-free core', sub: family.stack.core}}
                  contracts={family.stack.contracts ? {title: 'Contracts', sub: family.stack.contracts} : undefined}
                  caption="Arrows only point down. Families never reference each other."
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionTinted}>
          <div className={styles.container}>
            <h2 className={styles.heading}>Where it sits in the stack</h2>
            <p className={styles.lead}>
              Four families, one rule: no package references a sibling family, not even a type. What crosses a boundary is a
              subscription your app makes, such as playing an Environment cue when an Interactions press fires.
            </p>
            <div className={styles.siblings}>
              {families.map((f) => (
                <Link key={f.id} to={`/webxr/${f.id}`} className={clsx(styles.sibling, f.id === family.id && styles.siblingCurrent)}>
                  <span className={styles.eyebrow}>Family {f.number}</span>
                  <span className={styles.siblingName}>{f.name}</span>
                  <span className={styles.siblingBody}>{f.tagline}</span>
                </Link>
              ))}
            </div>
            <p className={styles.note}>
              The Service Framework for the web sits beside these four and keeps its own site:{' '}
              <a href="https://serviceframework.realitycollective.net/">serviceframework.realitycollective.net</a>.{' '}
              <Link to="/webxr/docs/concepts/layering-rule">The layering rule</Link> explains the boundaries in full.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.heading}>Why you would use it</h2>
            <div className={styles.reasons}>
              {family.reasons.map((r, i) => (
                <div key={r.title} className={styles.reason}>
                  <span className={styles.reasonNumber}>0{i + 1}</span>
                  <h3 className={styles.reasonTitle}>{r.title}</h3>
                  <p className={styles.body}>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionTinted}>
          <div className={styles.container}>
            <h2 className={styles.heading}>{family.adaptersHeading}</h2>
            <p className={styles.lead}>{family.adaptersLead}</p>
            <div className={clsx(styles.adapters, family.adapters.length === 3 && styles.adaptersThree)}>
              {family.adapters.map((a) => (
                <div key={a.title} className={styles.adapter}>
                  <h3 className={styles.adapterTitle}>{a.title}</h3>
                  <code className={styles.pkg}>{a.pkg}</code>
                  <p className={styles.bodySmall}>{a.body}</p>
                  <span className={clsx(styles.status, styles[`status_${a.status}`])}>{a.statusLabel}</span>
                  <Link className={styles.adapterLink} to={a.href}>
                    {a.status === 'pending' ? 'Roadmap →' : 'Read more →'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.band}>
          <div className={styles.container}>
            <h2 className={styles.headingDark}>Who does what</h2>
            <p className={styles.leadDark}>
              Read the ladder top to bottom. The middle column is the stage every engine goes through; the core owns the left,
              the adapter you install owns the right.
            </p>
            <div className={styles.ladder} role="table" aria-label="What the core and the adapter each do at every stage">
              <div className={styles.ladderHeadSide}>The core</div>
              <div className={styles.ladderHeadMid}>Stage</div>
              <div className={styles.ladderHeadSideRight}>The adapter</div>
              {family.ladder.map((rung) => (
                <div key={rung.stage} className={styles.rungRow}>
                  <div className={styles.rungSide}>{rung.core}</div>
                  <div className={styles.rungMid}>{rung.stage}</div>
                  <div className={styles.rungSideRight}>{rung.adapter}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={clsx(styles.twoCol, styles.twoColSpaced)}>
            <div className={styles.col}>
              <h2 className={styles.headingDark}>Five words you will meet</h2>
              <div className={styles.glossary}>
                {family.glossary.map(([term, def]) => (
                  <div key={term} className={styles.rung}>
                    <span className={styles.term}>{term}</span>
                    <span className={styles.def}>{def}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.col}>
              <h2 className={styles.headingDark}>Where to next</h2>
              {next.map((n) => (
                <Link key={n.label} to={n.to} className={styles.nextCard}>
                  <span className={styles.nextLabel}>{n.label} →</span>
                  <span className={styles.nextBody}>{n.body}</span>
                </Link>
              ))}
              <p className={styles.noteDark}>
                Source and issues: <a href={family.repo}>GitHub</a>. Questions go to the{' '}
                <a href="https://discord.gg/YjHAQD2XT8">Reality Collective Discord</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
