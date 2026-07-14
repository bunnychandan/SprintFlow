export type DocumentStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
export type DocumentVisibility = "PRIVATE" | "PROJECT" | "ORGANIZATION" | "PUBLIC";
export type DocumentType = "DOCUMENT" | "PAGE" | "POLICY" | "GUIDE" | "RUNBOOK" | "API" | "MEETING" | "DECISION";

export interface KnowledgeBaseItem {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string;
  createdById: string;
  createdByName: string | null;
  documentCount: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseDetail extends KnowledgeBaseItem {
  documents: DocumentItem[];
}

export interface DocumentItem {
  id: string;
  knowledgeBaseId: string;
  parentId: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  type: DocumentType;
  version: number;
  coverImage: string | null;
  icon: string | null;
  createdById: string;
  createdByName: string | null;
  updatedById: string | null;
  updatedByName: string | null;
  reviewerId: string | null;
  reviewerName: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  childCount: number;
  commentCount: number;
  isFavorited: boolean;
}

export interface DocumentDetail extends DocumentItem {
  content: string | null;
  parent: DocumentItem | null;
  children: DocumentItem[];
  comments: DocumentCommentItem[];
  versions: DocumentVersionItem[];
  favorites: { userId: string }[];
}

export interface DocumentCommentItem {
  id: string;
  documentId: string;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersionItem {
  id: string;
  documentId: string;
  version: number;
  title: string;
  content: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
}

export interface DocumentTimelineEvent {
  id: string;
  documentId: string;
  action: string;
  actorName: string | null;
  timestamp: string;
}

export interface DocumentStatistics {
  id: string;
  documentId: string;
  totalComments: number;
  totalVersions: number;
  totalViews: number;
  totalEdits: number;
  totalContributors: number;
  completion: number;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  status: DocumentStatus;
  type: DocumentType;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  knowledgeBaseId?: string;
  status?: string;
  type?: string;
  visibility?: string;
  parentId?: string | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  archived?: boolean;
}

export interface CreateKnowledgeBasePayload {
  name: string;
  description?: string | null;
  slug?: string;
  icon?: string | null;
  color?: string;
}

export interface UpdateKnowledgeBasePayload {
  name?: string;
  description?: string | null;
  slug?: string;
  icon?: string | null;
  color?: string;
}

export interface CreateDocumentPayload {
  knowledgeBaseId: string;
  parentId?: string | null;
  title: string;
  slug?: string;
  content?: string | null;
  excerpt?: string | null;
  type?: DocumentType;
  visibility?: DocumentVisibility;
  icon?: string | null;
  coverImage?: string | null;
}

export interface UpdateDocumentPayload {
  title?: string;
  slug?: string;
  content?: string | null;
  excerpt?: string | null;
  type?: DocumentType;
  visibility?: DocumentVisibility;
  status?: DocumentStatus;
  icon?: string | null;
  coverImage?: string | null;
  parentId?: string | null;
}

export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}
