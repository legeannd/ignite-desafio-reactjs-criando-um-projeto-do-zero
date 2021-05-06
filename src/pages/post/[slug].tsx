import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import Head from 'next/head';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <div className={styles.banner}>
        <img
          src={post.data.banner.url}
          alt={post.data.title}
          width="100%"
          height="100%"
        />
      </div>

      <div className={commonStyles.container}>
        <div className={styles.title}>{post.data.title}</div>

        <div className={styles.info}>
          <div className={styles.infoItens}>
            <FiCalendar />
            <span>{post.first_publication_date}</span>
          </div>
          <div className={styles.infoItens}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.infoItens}>
            <FiClock />
            <span>4 min</span>
          </div>
        </div>

        {post.data.content.map(content => (
          <article>
            <h2>{content.heading}</h2>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </article>
        ))}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      title: response.data.title,
      content: response.data.content.map(content => ({
        header: content.heading,
        body: [...content.body],
      })),
    },
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  } as Post;

  return {
    props: {
      post,
    },
    revalidate: 1800,
  };
};
