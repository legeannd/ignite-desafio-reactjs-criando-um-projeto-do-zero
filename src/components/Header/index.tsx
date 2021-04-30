import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.container}>
      <img src="logo.png" alt="Spacetraveler" />
    </div>
  );
}
