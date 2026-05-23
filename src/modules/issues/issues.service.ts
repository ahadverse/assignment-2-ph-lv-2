import pgPool from "../../config/database";
import {
  Issue,
  IssueWithReporter,
  CreateIssueBody,
  UpdateIssueBody,
  GetIssuesQuery,
} from "../../types";

interface IssueJoinRow extends Issue {
  reporter_name: string;
  reporter_role: "contributor" | "maintainer";
}

const toIssueWithReporter = (row: IssueJoinRow): IssueWithReporter => {
  const { reporter_id, reporter_name, reporter_role, ...rest } = row;
  return {
    ...rest,
    reporter: { id: reporter_id, name: reporter_name, role: reporter_role },
  };
};

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
  return result.rows[0];
};

export const getAllIssues = async (
  query: GetIssuesQuery,
): Promise<IssueWithReporter[]> => {
  const { sort = "newest", type, status } = query;
  const params: string[] = [];
  const conditions: string[] = [];
  let paramCount = 1;

  if (type) {
    conditions.push(`i.type = $${paramCount++}`);
    params.push(type);
  }
  if (status) {
    conditions.push(`i.status = $${paramCount++}`);
    params.push(status);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  const result = await pgPool.query<IssueJoinRow>(
    `SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
            u.name AS reporter_name, u.role AS reporter_role
     FROM issues i
     LEFT JOIN users u ON i.reporter_id = u.id
     ${where}
     ORDER BY i.created_at ${order}`,
    params,
  );

  return result.rows.map(toIssueWithReporter);
};

export const getIssueById = async (
  id: number,
): Promise<IssueWithReporter | null> => {
  const result = await pgPool.query<IssueJoinRow>(
    `SELECT i.id, i.title, i.description, i.type, i.status, i.reporter_id, i.created_at, i.updated_at,
            u.name AS reporter_name, u.role AS reporter_role
     FROM issues i
     LEFT JOIN users u ON i.reporter_id = u.id
     WHERE i.id = $1`,
    [id],
  );
  if (!result.rows[0]) return null;
  return toIssueWithReporter(result.rows[0]);
};

export const getIssueRawById = async (id: number): Promise<Issue | null> => {
  const result = await pgPool.query<Issue>(
    "SELECT * FROM issues WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
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
  return result.rows[0] || null;
};

export const deleteIssue = async (id: number): Promise<boolean> => {
  const result = await pgPool.query("DELETE FROM issues WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};
