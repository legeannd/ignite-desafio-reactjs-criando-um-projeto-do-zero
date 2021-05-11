import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import Head from 'next/head';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  navigation: {
    previousPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({ post, navigation }: PostProps): ReactElement {
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const isEdited = post.first_publication_date !== post.last_publication_date;

  const formattedEditDate = format(
    new Date(post.last_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce((acc, content) => {
    acc += content.heading.split(' ').length;

    const bodyWords = content.body.map(item => item.text.split(' ').length);
    bodyWords.map(words => (acc += words));
    return acc;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200);

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
            <span>{formattedDate}</span>
          </div>
          <div className={styles.infoItens}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.infoItens}>
            <FiClock />
            <span>{readingTime} min</span>
          </div>
        </div>
        {isEdited && (
          <span className={styles.editDate}>
            *editado em {formattedEditDate}
          </span>
        )}

        {post.data.content.map(content => (
          <article key={content.heading}>
            <h2 className={styles.heading}>{content.heading}</h2>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </article>
        ))}
      </div>

      <section className={`${commonStyles.container} ${styles.navigation}`}>
        {navigation?.previousPost.length > 0 && (
          <div>
            <h3>{navigation.previousPost[0].data.title}</h3>
            <Link href={`/post/${navigation.previousPost[0].uid}`}>
              <a>Post anterior</a>
            </Link>
          </div>
        )}

        {navigation?.nextPost.length > 0 && (
          <div>
            <h3>{navigation.nextPost[0].data.title}</h3>
            <Link href={`/post/${navigation.nextPost[0].uid}`}>
              <a>Próximo post</a>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
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

  const previousPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const post = {
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      subtitle: response.data.subtitle,
      title: response.data.title,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
  };

  return {
    props: {
      post,
      navigation: {
        previousPost: previousPost?.results,
        nextPost: nextPost?.results,
      },
    },
    revalidate: 60 * 60 * 24,
  };
};
