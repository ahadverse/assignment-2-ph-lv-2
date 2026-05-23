import pgPool from "../../config/database";
import {
  Issue,
  IssueWithReporter,
  ReporterInfo,
  CreateIssueBody,
  UpdateIssueBody,
  GetIssuesQuery,
} from "../../types";

export const createIssue = async (
  data: CreateIssueBody & { reporter_id: number },
): Promise<Issue> => {
  const { title, description, type, reporter_id } = data;
  const result = await pgPool.query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id],
  );
  return result?.rows?.[0] || null;
};

const attachReporters = async (
  issues: Issue[],
): Promise<IssueWithReporter[]> => {
  if (issues?.length === 0) return [];

  const reporterIds = [...new Set(issues?.map((i) => i.reporter_id))];
  const usersResult = await pgPool.query<ReporterInfo>(
    "SELECT id, name, role FROM users WHERE id = ANY($1)",
    [reporterIds],
  );

  const userMap = new Map(usersResult?.rows?.map((u) => [u.id, u]));

  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: userMap.get(reporter_id) ?? {
      id: reporter_id,
      name: "Unknown",
      role: "contributor" as const,
    },
  }));
};

export const getAllIssues = async (
  query: GetIssuesQuery,
): Promise<IssueWithReporter[]> => {
  const { sort = "newest", type, status } = query;
  const params: string[] = [];
  const conditions: string[] = [];
  let paramCount = 1;

  if (type) {
    conditions.push(`type = $${paramCount++}`);
    params.push(type);
  }
  if (status) {
    conditions.push(`status = $${paramCount++}`);
    params.push(status);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  const result = await pgPool.query<Issue>(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
    params,
  );

  return attachReporters(result.rows);
};

export const getIssueById = async (
  id: number,
): Promise<IssueWithReporter | null> => {
  const result = await pgPool.query<Issue>(
    "SELECT * FROM issues WHERE id = $1",
    [id],
  );
  if (!result?.rows?.[0]) return null;
  const [issue] = await attachReporters([result.rows[0]]);
  return issue;
};

export const getIssueRawById = async (id: number): Promise<Issue | null> => {
  const result = await pgPool.query<Issue>(
    "SELECT * FROM issues WHERE id = $1",
    [id],
  );
  return result?.rows?.[0] || null;
};

export const updateIssue = async (
  id: number,
  data: UpdateIssueBody,
): Promise<Issue | null> => {
  const fields: string[] = [];
  const params: (string | number)[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    params.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    params.push(data.description);
  }
  if (data.type !== undefined) {
    fields.push(`type = $${paramCount++}`);
    params.push(data.type);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    params.push(data.status);
  }

  if (fields.length === 0) return getIssueRawById(id);

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pgPool.query<Issue>(
    `UPDATE issues SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    params,
  );
  return result?.rows?.[0] || null;
};

export const deleteIssue = async (id: number): Promise<boolean> => {
  const result = await pgPool.query("DELETE FROM issues WHERE id = $1", [id]);
  return (result?.rowCount ?? 0) > 0;
};
