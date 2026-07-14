import { z } from "zod";

export const taskCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA_TESTING", "DONE", "BLOCKED", "CANCELLED", "REOPENED"]).optional().default("TODO"),
  priority: z.enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST", "CRITICAL"]).optional().default("MEDIUM"),
  type: z.enum(["EPIC", "STORY", "TASK", "SUBTASK", "BUG", "SPIKE", "IMPROVEMENT", "TECH_DEBT", "RESEARCH"]).optional().default("TASK"),
  originalEstimate: z.number().int().min(0).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  epicId: z.string().nullable().optional(),
  releaseId: z.string().nullable().optional(),
  storyPoints: z.number().int().min(0).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA_TESTING", "DONE", "BLOCKED", "CANCELLED", "REOPENED"]).optional(),
  priority: z.enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST", "CRITICAL"]).optional(),
  type: z.enum(["EPIC", "STORY", "TASK", "SUBTASK", "BUG", "SPIKE", "IMPROVEMENT", "TECH_DEBT", "RESEARCH"]).optional(),
  originalEstimate: z.number().int().min(0).nullable().optional(),
  timeSpent: z.number().int().min(0).nullable().optional(),
  timeRemaining: z.number().int().min(0).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  epicId: z.string().nullable().optional(),
  releaseId: z.string().nullable().optional(),
  backlogOrder: z.number().int().nullable().optional(),
  storyPoints: z.number().int().min(0).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  code: z.string().min(2, "Code must be at least 2 characters").max(10).toUpperCase(),
  description: z.string().max(2000).nullable().optional(),
  visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).optional().default("PRIVATE"),
  color: z.string().optional().default("#2563eb"),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED", "CANCELLED"]).optional(),
  color: z.string().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const sprintCreateSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "Sprint name is required").max(200),
  goal: z.string().max(1000).nullable().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional().default("PLANNING"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const sprintUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  goal: z.string().max(1000).nullable().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const sprintStartSchema = z.object({
  goal: z.string().max(1000).nullable().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const sprintCompleteSchema = z.object({
  forceComplete: z.boolean().optional().default(false),
});

export const sprintCancelSchema = z.object({
  reason: z.string().max(2000).optional(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().min(1),
  targetSprintId: z.string().nullable(),
});

export const bulkSprintActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["complete", "cancel", "delete"]),
  forceComplete: z.boolean().optional(),
});

export const userCreateSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().max(200).optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional().default("USER"),
  department: z.string().max(200).optional(),
  designation: z.string().max(200).optional(),
});

export const userUpdateSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
  isActive: z.boolean().optional(),
  name: z.string().max(200).optional(),
  department: z.string().max(200).nullable().optional(),
  designation: z.string().max(200).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
});

export const bulkUserActionSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, "At least one user ID is required"),
  action: z.enum(["activate", "deactivate", "delete", "restore", "updateRole"]),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
});

export const memberAddSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "TESTER", "BUSINESS_ANALYST", "VIEWER"]).optional().default("VIEWER"),
});

export const bulkTaskActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["archive", "restore", "delete", "changeStatus", "changePriority", "changeAssignee", "moveSprint"]),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA_TESTING", "DONE", "BLOCKED", "CANCELLED", "REOPENED"]).optional(),
  priority: z.enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST", "CRITICAL"]).optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
});

export const workLogSchema = z.object({
  timeSpent: z.number().int().min(1, "Time spent must be at least 1 minute"),
  description: z.string().max(2000).optional(),
  loggedAt: z.string().optional(),
});

export const checklistItemSchema = z.object({
  title: z.string().min(1, "Checklist item title is required").max(500),
  isChecked: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const checklistUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isChecked: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const relationshipSchema = z.object({
  relatedTaskId: z.string().min(1),
  type: z.enum(["BLOCKS", "BLOCKED_BY", "PARENT", "CHILD", "DUPLICATE", "RELATED", "DEPENDS_ON"]),
});

export const commentUpdateSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const commentCreateSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const epicCreateSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).nullable().optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional().default("MEDIUM"),
  color: z.string().optional().default("#6366f1"),
  ownerId: z.string().min(1),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const epicUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  color: z.string().optional(),
  ownerId: z.string().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const releaseCreateSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "Release name is required").max(200),
  version: z.string().max(50).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const releaseUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  version: z.string().max(50).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export const backlogReorderSchema = z.object({
  taskId: z.string().min(1),
  targetIndex: z.number().int().min(0),
});

export const backlogMoveSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  targetSprintId: z.string().nullable().optional(),
  targetEpicId: z.string().nullable().optional(),
  targetReleaseId: z.string().nullable().optional(),
});

export const backlogBulkSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  action: z.enum(["SET_PRIORITY", "SET_ASSIGNEE", "SET_STATUS", "SET_LABELS"]),
  value: z.string().nullable(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export const deploymentCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  releaseId: z.string().optional(),
  version: z.string().min(1, "Version is required"),
  environment: z.enum(["DEVELOPMENT", "TESTING", "STAGING", "PRODUCTION"]),
  commitHash: z.string().optional(),
  branch: z.string().optional(),
});

export const deploymentUpdateSchema = z.object({
  version: z.string().optional(),
  environment: z.enum(["DEVELOPMENT", "TESTING", "STAGING", "PRODUCTION"]).optional(),
  commitHash: z.string().optional(),
  branch: z.string().optional(),
});

export const pipelineCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  provider: z.string().optional().default("CUSTOM"),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

export const pipelineUpdateSchema = z.object({
  name: z.string().optional(),
  provider: z.string().optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

export type DeploymentCreateInput = z.infer<typeof deploymentCreateSchema>;
export type DeploymentUpdateInput = z.infer<typeof deploymentUpdateSchema>;
export type PipelineCreateInput = z.infer<typeof pipelineCreateSchema>;
export type PipelineUpdateInput = z.infer<typeof pipelineUpdateSchema>;

export type SprintCreateInput = z.infer<typeof sprintCreateSchema>;
export type SprintUpdateInput = z.infer<typeof sprintUpdateSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type MemberAddInput = z.infer<typeof memberAddSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type EpicCreateInput = z.infer<typeof epicCreateSchema>;
export type EpicUpdateInput = z.infer<typeof epicUpdateSchema>;
export type ReleaseCreateInput = z.infer<typeof releaseCreateSchema>;
export type ReleaseUpdateInput = z.infer<typeof releaseUpdateSchema>;

export const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  slug: z.string().max(200).optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().optional().default("#6366f1"),
});

export const updateKnowledgeBaseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  slug: z.string().max(200).optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().optional(),
});

export const createDocumentSchema = z.object({
  knowledgeBaseId: z.string().min(1, "Knowledge base ID is required"),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required").max(500),
  slug: z.string().max(500).optional(),
  content: z.string().nullable().optional(),
  excerpt: z.string().max(500).nullable().optional(),
  type: z.enum(["DOCUMENT", "PAGE", "POLICY", "GUIDE", "RUNBOOK", "API", "MEETING", "DECISION"]).optional().default("DOCUMENT"),
  visibility: z.enum(["PRIVATE", "PROJECT", "ORGANIZATION", "PUBLIC"]).optional().default("ORGANIZATION"),
  icon: z.string().max(50).nullable().optional(),
  coverImage: z.string().max(500).nullable().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().max(500).optional(),
  content: z.string().nullable().optional(),
  excerpt: z.string().max(500).nullable().optional(),
  type: z.enum(["DOCUMENT", "PAGE", "POLICY", "GUIDE", "RUNBOOK", "API", "MEETING", "DECISION"]).optional(),
  visibility: z.enum(["PRIVATE", "PROJECT", "ORGANIZATION", "PUBLIC"]).optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  icon: z.string().max(50).nullable().optional(),
  coverImage: z.string().max(500).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export const publishDocumentSchema = z.object({
  reviewerId: z.string().optional(),
});

export const archiveDocumentSchema = z.object({});

export const duplicateDocumentSchema = z.object({
  targetKnowledgeBaseId: z.string().optional(),
  includeChildren: z.boolean().optional().default(false),
});

export const restoreDocumentVersionSchema = z.object({
  version: z.number().int().min(1),
});

export const createDocumentCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const updateDocumentCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const documentSearchSchema = z.object({
  query: z.string().min(1).max(500),
  knowledgeBaseId: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  type: z.enum(["DOCUMENT", "PAGE", "POLICY", "GUIDE", "RUNBOOK", "API", "MEETING", "DECISION"]).optional(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export type KnowledgeBaseCreateInput = z.infer<typeof createKnowledgeBaseSchema>;
export type KnowledgeBaseUpdateInput = z.infer<typeof updateKnowledgeBaseSchema>;
export type DocumentCreateInput = z.infer<typeof createDocumentSchema>;
export type DocumentUpdateInput = z.infer<typeof updateDocumentSchema>;
export type DocumentCommentCreateInput = z.infer<typeof createDocumentCommentSchema>;
export type DocumentCommentUpdateInput = z.infer<typeof updateDocumentCommentSchema>;

export const createConversationSchema = z.object({
  title: z.string().max(200).optional().default("New Conversation"),
  agentType: z.enum(["GENERAL", "PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "DEVOPS", "BUSINESS_ANALYST", "QA", "DOCUMENTATION"]).optional().default("GENERAL"),
  provider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "OLLAMA", "CUSTOM"]).optional().default("OPENAI"),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  taskId: z.string().optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().max(200).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  agentType: z.enum(["GENERAL", "PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "DEVOPS", "BUSINESS_ANALYST", "QA", "DOCUMENTATION"]).optional(),
  provider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "OLLAMA", "CUSTOM"]).optional(),
});

export const createChatMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, "Message is required").max(50000),
  provider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "OLLAMA", "CUSTOM"]).optional(),
  agentType: z.enum(["GENERAL", "PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "DEVOPS", "BUSINESS_ANALYST", "QA", "DOCUMENTATION"]).optional(),
  model: z.string().optional(),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  taskId: z.string().optional(),
});

export const createPromptSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.enum(["GENERAL", "PROJECT", "TASK", "SPRINT", "DOCUMENTATION", "DEVOPS", "ANALYTICS", "RESOURCE", "CUSTOM"]).optional().default("GENERAL"),
  description: z.string().max(2000).nullable().optional(),
  prompt: z.string().min(1, "Prompt is required").max(50000),
  isPublic: z.boolean().optional().default(false),
});

export const updatePromptSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.enum(["GENERAL", "PROJECT", "TASK", "SPRINT", "DOCUMENTATION", "DEVOPS", "ANALYTICS", "RESOURCE", "CUSTOM"]).optional(),
  description: z.string().max(2000).nullable().optional(),
  prompt: z.string().min(1).max(50000).optional(),
  isPublic: z.boolean().optional(),
});

export const usageQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
  provider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "OLLAMA", "CUSTOM"]).optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ConversationCreateInput = z.infer<typeof createConversationSchema>;
export type ConversationUpdateInput = z.infer<typeof updateConversationSchema>;
export type ChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type PromptCreateInput = z.infer<typeof createPromptSchema>;
export type PromptUpdateInput = z.infer<typeof updatePromptSchema>;
