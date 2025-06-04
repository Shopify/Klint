import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import Heading from "@theme/Heading";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary")}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Carolyn's Experiments
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <ul>
          <li>
            <Link className="button" to="/experiments/palette">
              Palette
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/swans17">
              Swans, no 17
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/moire">
              Moire
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/moire2">
              Moire2
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/moire3">
              Moire3
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/draw">
              Draw
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/mandala">
              Mandala
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/mandala2">
              Mandala2
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/slimeMould">
              Slime Mould
            </Link>
          </li>
          <li>
            <Link className="button" to="/experiments/Stripes">
              Hi Josh
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main></main>
    </Layout>
  );
}
