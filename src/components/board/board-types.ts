export interface BoardColumnData {
  id: string;
  status: string;
  label: string;
  tasks: BoardCardData[];
  taskCount: number;
  collapsed?: boolean;
  width?: number;
}

export interface BoardCardData {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  storyPoints: number | null;
  assigneeId: string | null;
  assignee: { id: string; name: string | null; email: string; image: string | null } | null;
  reporter: { id: string; name: string | null; email: string; image: string | null };
  sprintId: string | null;
  projectId: string;
  labels: string[] | null;
  dueDate: string | null;
  order: number;
  commentCount: number;
  attachmentCount: number;
  checklistTotal: number;
  checklistDone: number;
}
