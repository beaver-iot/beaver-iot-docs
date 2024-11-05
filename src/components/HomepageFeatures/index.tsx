import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { ProjectName } from '../../consts';

type FeatureItem = {
  title: string;
  Img: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Connect Everything',
    Img: '/img/wide-logo.svg',
    description: (
      <>
        {ProjectName} was designed from the ground up to be easily installed and
        used to manage your IoT devices and applications quickly.
      </>
    ),
  },
];

function Feature({title, Img, description}: FeatureItem) {
  return (
    <div className={clsx('col')}>
      <div className="text--center">
        <img src={Img} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
