export type DocumentStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
export type DocumentVisibility = "PRIVATE" | "PROJECT" | "ORGANIZATION" | "PUBLIC";
export type DocumentType = "DOCUMENT" | "PAGE" | "POLICY" | "GUIDE" | "RUNBOOK" | "API" | "MEETING" | "DECISION";

export interface KnowledgeBase {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string;
  createdById: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseWithMeta extends KnowledgeBase {
  documentCount: number;
  createdByName: string;
}

export interface DocumentItem {
  id: string;
  knowledgeBaseId: string;
  parentId: string | null;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  type: DocumentType;
  version: number;
  coverImage: string | null;
  icon: string | null;
  createdById: string;
  updatedById: string | null;
  reviewerId: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentWithMeta extends DocumentItem {
  knowledgeBaseName: string;
  createdByName: string;
  updatedByName: string | null;
  reviewerName: string | null;
  commentCount: number;
  isFavorited: boolean;
  childrenCount: number;
}

export interface DocumentDetail extends DocumentWithMeta {
  content: string;
  children: DocumentItem[];
  parent: DocumentItem | null;
}

export interface DocumentCommentItem {
  id: string;
  documentId: string;
  authorId: string;
  authorName: string;
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
  createdByName: string;
  createdAt: string;
}

export interface KnowledgeDashboard {
  totalBases: number;
  totalDocuments: number;
  publishedCount: number;
  draftCount: number;
  reviewCount: number;
  archivedCount: number;
  recentDocuments: DocumentWithMeta[];
  popularDocuments: DocumentWithMeta[];
  favoriteDocuments: DocumentWithMeta[];
  bases: KnowledgeBaseWithMeta[];
}

export interface KnowledgeFilters {
  search?: string;
  status?: DocumentStatus;
  visibility?: DocumentVisibility;
  type?: DocumentType;
  knowledgeBaseId?: string;
  page?: number;
  pageSize?: number;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  status: DocumentStatus;
  knowledgeBaseName: string;
  knowledgeBaseId: string;
  type: DocumentType;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTimelineEvent {
  id: string;
  documentId: string;
  action: string;
  actorName: string;
  details: string | null;
  createdAt: string;
}

export interface DocumentStatistics {
  totalViews: number;
  totalComments: number;
  totalVersions: number;
  averageWords: number;
  daysSinceCreated: number;
  daysSinceUpdated: number;
}

export interface KnowledgeListResponse {
  data: KnowledgeBaseWithMeta[];
  total: number;
}

export interface DocumentListResponse {
  data: DocumentWithMeta[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
