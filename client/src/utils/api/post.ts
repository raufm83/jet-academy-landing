import { Post, PostsResponse } from "@/types/post";
import { PostType } from "@/types/enums";
import { getAllPostTags } from "@/utils/helpers/post";
import api from "./axios";

/**
 * Fetches post details by slug
 * @param slug The post slug
 * @returns Post details
 */
export async function getPostDetails(slug: string): Promise<Post | null> {
  try {
    const { data } = await api.get(`/posts/slug/${slug}`);
    return data;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
}

interface RelatedPostsParams {
  postId: string;
  postType: PostType;
  tags: unknown;
  limit?: number;
}

/**
 * Fetches related posts based on post type and tags
 * @param params Parameters for related posts
 * @returns Array of related posts
 */
export async function getRelatedPosts({
  postId,
  postType,
  tags,
  limit = 3,
}: RelatedPostsParams): Promise<Post[]> {
  try {
    const { data } = await api.get(`/posts/type/${postType}`);

    const relatedPosts = data.items
      .filter((post: Post) => {
        if (post.id === postId) return false;
        const sourceTags = getAllPostTags(tags);
        const postTags = getAllPostTags(post.tags);
        return postTags.some((tag) => sourceTags.includes(tag));
      })
      .slice(0, limit);

    return relatedPosts;
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}

/**
 * Fetches posts by type
 * @param type The post type
 * @param page Page number for pagination
 * @param limit Items per page
 * @returns Paginated posts of the specified type
 */
export async function getPostsByType(
  type: PostType,
  page = 1,
  limit = 10
): Promise<{
  items: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const { data } = await api.get(
      `/posts/type/${type}?page=${page}&limit=${limit}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching posts of type ${type}:`, error);
    return {
      items: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
}

/**
 * Fetches latest posts
 * @param limit Number of posts to fetch
 * @returns Array of latest posts
 */
export async function getLatestPosts(limit = 4): Promise<Post[]> {
  try {
    const { data } = await api.get(`/posts?limit=${limit}`);
    return data.items;
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}

/**
 * Fetches all posts
 * @param limit Number of posts to fetch
 * @returns Array of latest posts
 */
export async function getAllPosts({
  page,
  limit,
  postType,
  includeBlogs = false,
  eventStatus,
  authorId,
  tag,
}: any): Promise<PostsResponse> {
  try {
    let url = `/posts?limit=${limit}&page=${page}&includeBlogs=${includeBlogs}`;

    if (postType) {
      url = `/posts/type/${postType}?limit=${limit}&page=${page}&type=${postType ? postType?.toUpperCase() : ""
        }&includeBlogs=${includeBlogs}`;
    }

    if (eventStatus) {
      url += `&eventStatus=${eventStatus}`;
    }

    if (authorId) {
      url += `&authorId=${authorId}`;
    }

    if (tag && String(tag).trim()) {
      url += `&tag=${encodeURIComponent(String(tag).trim())}`;
    }

    const { data } = await api.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return {
      items: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
}

/**
 * Creates a new post
 * @param postData Post data to create
 * @returns Created post
 */
export async function createPost(postData: any): Promise<Post> {
  try {
    const { data } = await api.post("/posts", postData);
    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Updates an existing post
 * @param id Post ID
 * @param postData Post data to update
 * @returns Updated post
 */
export async function updatePost(id: string, postData: any): Promise<Post> {
  try {
    const { data } = await api.patch(`/posts/${id}`, postData);
    return data;
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a post
 * @param id Post ID
 * @returns Success status
 */
export async function deletePost(id: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
}

/**
 * Upload image for post content (WYSIWYG). Server resizes to 1024×1024 and converts to WebP.
 * Returns relative URL /uploads/post-content/xxx.webp so Next.js rewrite proxies to API (deploy-safe).
 */
export async function uploadContentImage(file: File): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("image", file);
    const res = await api.post<{ path?: string | null }>(
      "/posts/upload-content-image",
      form,
    );
    const path = res.data?.path ?? (res.data as any)?.data?.path;
    if (!path || typeof path !== "string") return null;
    const clean = path.replace(/^\//, "").replace(/^uploads\//, "");
    return `/uploads/${clean}`;
  } catch (error) {
    console.error("Error uploading content image:", error);
    return null;
  }
}
