export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, 'password'>;

export interface JwtPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReporterInfo {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: ReporterInfo;
}

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: 'contributor' | 'maintainer';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}

export interface GetIssuesQuery {
  sort?: 'newest' | 'oldest';
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
