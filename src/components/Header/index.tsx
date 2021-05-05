import Link from 'next/link';
import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.container}>
      <Link href="/">
        <a>
          <img src="/logo.png" alt="Spacetraveler" />
        </a>
      </Link>
    </div>
  );
}
