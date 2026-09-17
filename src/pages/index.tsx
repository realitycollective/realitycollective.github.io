import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import SunsetHero from '@site/src/components/SunsetHero';
import useGlobalData from '@docusaurus/useGlobalData';
import {links} from '@site/src/links';
import type {LatestPost} from '@site/plugins/latest-posts';
import styles from './index.module.css';

const projects = [
  {
    eyebrow: 'Unity',
    title: 'Reality Toolkit',
    body: 'A cross-platform XR toolkit for Unity: player rig, input, interactions, locomotion and platform packages for OpenXR, Meta, Pico and visionOS.',
    href: links.realityToolkit,
    external: true,
  },
  {
    eyebrow: 'Unity and Web',
    title: 'Service Framework',
    body: 'One service model with a lifecycle, explicit dependencies and swappable implementations. Ships in C# for Unity and in TypeScript for React, three.js, Babylon.js and Meta IWSDK.',
    href: links.serviceFramework,
    external: true,
  },
  {
    eyebrow: 'Web',
    title: 'Reality Toolkit WebXR',
    body: 'Engine-free input, interactions, spatial UI and environment for WebXR. Write against the core once and run it on three.js, Babylon.js, Meta IWSDK or Google XR Blocks.',
    href: '/webxr',
    external: false,
  },
];

const platforms = ['Unity 6', 'OpenXR', 'Meta Quest', 'Pico', 'visionOS', 'three.js', 'Babylon.js', 'Meta IWSDK', 'Google XR Blocks', 'React'];

const postDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});

export default function Home(): ReactNode {
  // The newest posts, supplied by plugins/latest-posts.ts from the blog's own loaded content.
  const {posts} = useGlobalData()['latest-posts'].default as {posts: LatestPost[]};
  return (
    <Layout
      title="Build it once. Ship it everywhere."
      description="The Reality Collective builds free, open source frameworks for XR development in Unity and on the web: the Reality Toolkit, the Service Framework and Reality Toolkit WebXR.">
      <main className={`rc-dark-nav ${styles.page}`}>
        <SunsetHero globe>
          <div className={styles.heroInner}>
            <span className={styles.pill}>Open source XR frameworks</span>
            <h1 className={styles.title}>
              Build it once.
              <br />
              Ship it everywhere.
            </h1>
            <p className={styles.lead}>
              Unity, WebXR, or both. The Reality Collective&apos;s toolkits carry the platform differences so your app does
              not have to.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href="#projects">
                See the projects
              </a>
              <a className={styles.secondary} href={links.discord}>
                Join Discord
              </a>
            </div>
          </div>
        </SunsetHero>

        <section id="projects" className={styles.projects}>
          {projects.map((p) =>
            p.external ? (
              <a key={p.title} className={styles.card} href={p.href}>
                <span className={styles.eyebrow}>{p.eyebrow}</span>
                <h2 className={styles.cardTitle}>{p.title}</h2>
                <p className={styles.cardBody}>{p.body}</p>
                <span className={styles.cardLink}>Learn more →</span>
              </a>
            ) : (
              <Link key={p.title} className={styles.card} to={p.href}>
                <span className={styles.eyebrow}>{p.eyebrow}</span>
                <h2 className={styles.cardTitle}>{p.title}</h2>
                <p className={styles.cardBody}>{p.body}</p>
                <span className={styles.cardLink}>Learn more →</span>
              </Link>
            ),
          )}
        </section>

        <section className={styles.about}>
          <div className={styles.aboutCopy}>
            <span className={styles.eyebrowAccent}>What the Collective is</span>
            <h2 className={styles.heading}>One community, three frameworks, every headset we can reach.</h2>
            <p className={styles.body}>
              Founded in 2022 by the maintainers of the Reality Toolkit. Everything is MIT licensed, the roadmaps are
              public, and the maintainers answer on Discord.
            </p>
            <div className={styles.inlineLinks}>
              <Link to="/about">About us</Link>
              <Link to="/mission">Our mission</Link>
              <Link to="/contribution">Contribution</Link>
            </div>
          </div>
          <div className={styles.chips}>
            {platforms.map((name) => (
              <span key={name} className={styles.chip}>
                {name}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.blog}>
          <div className={styles.blogHead}>
            <h2 className={styles.headingSmall}>From the blog</h2>
            <Link to="/blog" className={styles.moreLink}>
              All posts →
            </Link>
          </div>
          <div className={styles.posts}>
            {posts.map((post) => (
              <Link key={post.permalink} to={post.permalink} className={styles.post}>
                <span className={styles.eyebrow}>{postDate.format(new Date(post.date))}</span>
                <h3 className={styles.postTitle}>{post.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
