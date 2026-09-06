function isPublished(post) {
  return post.data?.draft !== true;
}

export function getArticleSlug(post) {
  const segments = post.id.split('/').filter(Boolean);
  return segments.at(-1) || post.id;
}

export function getArticleHref(post) {
  return `/articles/${getArticleSlug(post)}`;
}

function getPublishedPostsWithUniqueSlugs(posts) {
  const publishedPosts = posts.filter(isPublished);
  const postsBySlug = new Map();

  for (const post of publishedPosts) {
    const slug = getArticleSlug(post);
    const existingPost = postsBySlug.get(slug);
    if (existingPost) {
      throw new Error(
        `Duplicate article slug "${slug}" from "${existingPost.id}" and "${post.id}"`,
      );
    }
    postsBySlug.set(slug, post);
  }

  return publishedPosts;
}

export function buildArticleListing(posts) {
  return getPublishedPostsWithUniqueSlugs(posts).map((post) => ({
    href: getArticleHref(post),
    post,
  }));
}

export function buildArticleStaticPaths(posts) {
  return getPublishedPostsWithUniqueSlugs(posts).map((post) => ({
    params: { slug: getArticleSlug(post) },
    props: { post },
  }));
}
