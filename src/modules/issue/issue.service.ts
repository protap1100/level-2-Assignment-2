import { pool } from "../../db";

const createIssue = async (
  payload: {
    title: string;
    description: string;
    type: "bug" | "feature_request";
  },
  userId: number,
) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `INSERT INTO issues 
     (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, userId],
  );

  return result.rows[0];
};

const getAllIssues = async (query: Record<string, unknown>) => {
  const { sort = "newest", type, status } = query;

  let sql = `SELECT * FROM issues`;
  const values: (string | number)[] = [];
  const conditions: string[] = [];

  if (type) {
    values.push(type as string);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status as string);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  let reportersMap: Record<number, unknown> = {};

  if (reporterIds.length > 0) {
    const usersResult = await pool.query(
      `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
      `,
      [reporterIds],
    );

    reportersMap = usersResult.rows.reduce(
      (acc, user) => {
        acc[user.id] = {
          id: user.id,
          name: user.name,
          role: user.role,
        };
        return acc;
      },
      {} as Record<number, unknown>,
    );
  }

  const formattedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reportersMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return formattedIssues;
};

const getSingleIssue = async (id: number) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];

  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const reporter = userResult.rows[0] || null;
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssue = async (
  id: number,
  payload: {
    title?: string;
    description?: string;
    type?: "bug" | "feature_request";
  },
  user: { id: number; role: string }
) => {
  // 1. Get issue
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );

  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];

  // 2. Permission check

  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;

  if (!isMaintainer) {
    // contributor rules
    if (!isOwner || issue.status !== "open") {
      return {
        error: "FORBIDDEN",
      };
    }
  }

  // 3. Build update dynamically
  const fields: string[] = [];
  const values: any[] = [];

  if (payload.title) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.type) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }

  // Always update timestamp
  values.push(id);
  fields.push(`updated_at = NOW()`);

  const sql = `
    UPDATE issues
    SET ${fields.join(", ")}
    WHERE id = $${values.length}
    RETURNING *
  `;

  const updated = await pool.query(sql, values);

  return updated.rows[0];
};

export const issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue
};
