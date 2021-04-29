import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { useState } from 'react';
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

export default function Home({
  postsPagination,
}: HomeProps): React.ReactElement {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [hasNext, setHasNext] = useState(postsPagination.next_page !== null);
  console.log(postsPagination.next_page);

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        {posts.length === 0 ? (
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
                <Link href={postsPagination.next_page}>
                  <a>
                    <span>Carregar mais posts</span>
                  </a>
                </Link>
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
      pageSize: 3,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
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
