export type Category = { id: number; name: string };

export type User = {
  id: string;
  email: string;
  passwordHash: string;
};

export type Post = {
  id: number
  title: string
  content: string
  category: string
}

export interface CreatePostInput {
  title: string;
  content: string;
  author?: string;
  category?: string;
}