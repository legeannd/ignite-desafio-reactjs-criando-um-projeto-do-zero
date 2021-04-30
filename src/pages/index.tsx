import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { useEffect, useState } from 'react';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export default function Home({
  postsPagination,
}: HomeProps): React.ReactElement {
  const [posts, setPosts] = useState<Post[]>();
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [hasNext, setHasNext] = useState(postsPagination.next_page !== null);

  useEffect(() => {
    const formattedPosts = postsPagination.results.map((post: Post) => ({
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    }));

    setPosts(formattedPosts);
  }, [postsPagination.results]);

  async function handleNextPage(): Promise<void> {
    const response: PostPagination = await fetch(nextPage).then(results =>
      results.json()
    );

    setNextPage(response.next_page);
    setHasNext(response.next_page !== null);

    const newPosts = response.results.map(
      result =>
        ({
          data: result.data,
          first_publication_date: format(
            new Date(result.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
          uid: result.uid,
        } as Post)
    );

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <header className={styles.headerContainer}>
          <Header />
        </header>

        {!posts ? (
          <div className={styles.singlePost}>
            <strong>Nenhum post disponível!</strong>
          </div>
        ) : (
          <div className={styles.posts}>
            {posts.map(post => (
              <div key={post.uid} className={styles.singlePost}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <strong>{post.data.title}</strong>
                  </a>
                </Link>
                <p>{post.data.subtitle}</p>
                <div className={styles.iconsContainer}>
                  <div>
                    <FiCalendar /> <span>{post.first_publication_date}</span>
                  </div>
                  <div>
                    <FiUser /> <span>{post.data.author}</span>
                  </div>
                </div>
              </div>
            ))}
            {hasNext && (
              <div className={styles.loadPosts}>
                <button type="button" onClick={handleNextPage}>
                  <span>Carregar mais posts</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
