import { pool } from "../../db";

const createIssue = async (
  payload: {
    title: string;
    description: string;
    type: "bug" | "feature_request";
  },
  userId: number
) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `INSERT INTO issues 
     (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, userId]
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

  const reporterIds = [
    ...new Set(issues.map((issue) => issue.reporter_id)),
  ];

  let reportersMap: Record<number, unknown> = {};

  if (reporterIds.length > 0) {
    const usersResult = await pool.query(
      `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
      `,
      [reporterIds]
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
      {} as Record<number, unknown>
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

export const issueService = {
  createIssue,
  getAllIssues
};