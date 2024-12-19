import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type ProjectItem = {
  title: string;
  description: JSX.Element;
  url: string;
};

const FeatureList: ProjectItem[] = [
  {
    title: 'Reality Toolkit',
    description: (
      <>
        The Reality Toolkit was designed from the ground up to aid with AR, VR or XR development in Unity
      </>
    ),
    url: 'https://realitytoolkit.realitycollective.net/'
  },
  {
    title: 'Service Framework',
    description: (
      <>
        An extensible service framework to build highly performant components for your Unity projects
      </>
    ),
    url: 'https://serviceframework.realitycollective.net/'
  },
  {
    title: 'Utilities',
    description: (
      <>
        A collection of useful utilities for Unity Projects
      </>
    ),
    url: 'https://serviceframework.realitycollective.net/'
  },
];

function Project({ title, description, url }: ProjectItem) {
  return (
    <div className={clsx('col col--4')}>
      <a href={url}>
        <div className={styles.projectItem}>
          <div className={styles.projectItem_Content}>
            <div className="text--center padding-horiz--md">
              <h3 className={styles.projectItem_Title}>{title}</h3>
              <p>{description}</p>
            </div>
          </div>
          <div className={styles.projectItem_Link}>
            <span>LEARN MORE</span>
            <svg className={styles.projectItem_Link_SVG} viewBox="0 0 24 24">
              <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function HomepageProducts(): JSX.Element {
  return (
    <section className={styles.projects}>
      <div className="container">
        <p className="hero__subtitle">List of projects developed and maintained by the Collective:</p>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Project key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
