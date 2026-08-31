export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  points: number;
  created_at: string;
  updated_at: string;
}

export type IssueCategory =
  | 'pothole'
  | 'streetlight'
  | 'garbage'
  | 'water_leak'
  | 'traffic'
  | 'tree'
  | 'electrical'
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'Work Started'
  | 'Resolved'
  | 'Closed'
  | 'Rejected'
  | 'Duplicate';

export interface IssueImage {
  id: string;
  issue_id: string;
  image_url: string;
  image_type: 'REPORT' | 'BEFORE' | 'AFTER';
  uploaded_by?: string;
  created_at: string;
}

export interface IssueStatusHistory {
  id: string;
  issue_id: string;
  old_status?: IssueStatus | null;
  new_status: IssueStatus;
  changed_by?: string;
  changed_by_name?: string;
  note?: string;
  created_at: string;
}

export interface CivicTeam {
  id: string;
  name: string;
  leader_name: string;
  mobile_number: string;
  is_active: boolean;
  assigned_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  report_id: string;
  citizen_id: string;
  citizen_name?: string;
  citizen_email?: string;
  category: IssueCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  severity: IssueSeverity;
  people_affected: number;
  priority_score: number;
  priority_level: PriorityLevel;
  priority_explanation: string;
  status: IssueStatus;
  // Team assignment fields
  assigned_team_id?: string | null;
  assigned_team_name?: string | null;
  assigned_team_leader?: string | null;
  assigned_team_phone?: string | null;
  assigned_at?: string | null;
  assigned_by?: string | null;
  images?: IssueImage[];
  status_history?: IssueStatusHistory[];
  feedback?: CitizenFeedback;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CitizenFeedback {
  id: string;
  issue_id: string;
  citizen_id: string;
  citizen_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  issue_id: string;
  report_id?: string;
  title: string;
  message: string;
  type: 'status_update' | 'point_award' | 'general';
  read: boolean;
  created_at: string;
}

export interface PriorityScoreBreakdown {
  score: number;
  level: PriorityLevel;
  severityPoints: number;
  peoplePoints: number;
  locationPoints: number;
  categoryPoints: number;
  explanation: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  resolved_count: number;
  avatar_url?: string;
}
