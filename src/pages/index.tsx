import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <div className={styles.singlePost}>
            <Link href="/">
              <a>
                <strong>Como utilizar Hooks</strong>
              </a>
            </Link>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.iconsContainer}>
              <div>
                <FiCalendar /> <span>15 Mar 2021</span>
              </div>
              <div>
                <FiUser /> <span>Gean Lucas</span>
              </div>
            </div>
          </div>
          <div className={styles.singlePost}>
            <Link href="/">
              <a>
                <strong>Como utilizar Hooks</strong>
              </a>
            </Link>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.iconsContainer}>
              <div>
                <FiCalendar /> <span>15 Mar 2021</span>
              </div>
              <div>
                <FiUser /> <span>Gean Lucas</span>
              </div>
            </div>
          </div>
          <div className={styles.singlePost}>
            <Link href="/">
              <a>
                <strong>Como utilizar Hooks</strong>
              </a>
            </Link>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.iconsContainer}>
              <div>
                <FiCalendar /> <span>15 Mar 2021</span>
              </div>
              <div>
                <FiUser /> <span>Gean Lucas</span>
              </div>
            </div>
          </div>
          <div className={styles.loadPosts}>
            <Link href="/">
              <a>
                <span>Carregar mais posts</span>
              </a>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
