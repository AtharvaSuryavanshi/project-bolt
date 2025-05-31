export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  categories: string[];
  tags: string[];
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readingTime: number;
}

export interface BlogDraft {
  id?: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  categories: string[];
  tags: string[];
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface EditorState {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  categories: string[];
  tags: string[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
  error?: string;
}