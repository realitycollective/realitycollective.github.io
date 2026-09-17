import type {LoadContext, Plugin} from '@docusaurus/types';
import type {BlogContent} from '@docusaurus/plugin-content-blog';

// Exposes the newest blog posts to the homepage through global data, so the "From the blog" strip
// updates by itself when a post lands. It reads the blog plugin's loaded content in allContentLoaded
// rather than parsing the markdown a second time, so the dates, titles and permalinks are exactly the
// ones the blog itself renders. Read it with useGlobalData()['latest-posts'].default.posts.
export interface LatestPost {
  title: string;
  permalink: string;
  /** ISO date string. */
  date: string;
  description: string;
}

export default function latestPostsPlugin(_context: LoadContext, options: {count?: number} = {}): Plugin<void> {
  const count = options.count ?? 3;
  return {
    name: 'latest-posts',
    allContentLoaded({allContent, actions}) {
      const blog = allContent['docusaurus-plugin-content-blog']?.default as BlogContent | undefined;
      const posts: LatestPost[] = (blog?.blogPosts ?? [])
        .filter((post) => !post.metadata.unlisted)
        .slice(0, count)
        .map((post) => ({
          title: post.metadata.title,
          permalink: post.metadata.permalink,
          date: post.metadata.date.toISOString(),
          description: post.metadata.description ?? '',
        }));
      actions.setGlobalData({posts});
    },
  };
}
