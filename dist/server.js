
   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  refresh_secret: process.env.REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor',
        CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL
          CHECK (LENGTH(description) >= 20),
        type VARCHAR(20) NOT NULL
          CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open'
          CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
var createUserInfoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `,
    [
      name,
      email,
      hashedPassword,
      role ?? "contributor"
    ]
  );
  return result.rows[0];
};
var userService = {
  createUserInfoDB
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserInfoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var registerUser = async (payload) => {
  const { name, email, password, role } = payload;
  const hash = await bcrypt2.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hash, role ?? "contributor"]
  );
  return result.rows[0];
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email
  ]);
  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = userResult.rows[0];
  const isMatch = await bcrypt2.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    config_default.jwt_secret,
    { expiresIn: "7d" }
  );
  delete user.password;
  return {
    token,
    user
  };
};
var authServices = {
  registerUser,
  loginUser
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await authServices.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var login = async (req, res) => {
  try {
    const result = await authServices.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/signup", authController.signup);
router2.post("/login", authController.login);
var authRoute = router2;

// src/modules/auth/auth.test.route.ts
import { Router as Router3 } from "express";

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access"
        });
      }
      const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const decoded = jwt2.verify(
        token,
        config_default.jwt_secret
      );
      const userData = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        decoded.id
      ]);
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      const user = userData.rows[0];
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource"
        });
      }
      req.user = {
        id: user.id,
        name: user.name,
        role: user.role
      };
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_middleware_default = auth;

// src/modules/auth/auth.test.route.ts
var router3 = Router3();
router3.get("/test", auth_middleware_default("maintainer"), (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user
  });
});

// src/modules/issue/issue.route.ts
import { Router as Router4 } from "express";

// src/modules/issue/issue.service.ts
var createIssue = async (payload, userId) => {
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
var getAllIssues = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues`;
  const values = [];
  const conditions = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
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
  let reportersMap = {};
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
          role: user.role
        };
        return acc;
      },
      {}
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
    updated_at: issue.updated_at
  }));
  return formattedIssues;
};
var getSingleIssue = async (id) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  if (issueResult.rows.length === 0) {
    return null;
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
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
    updated_at: issue.updated_at
  };
};
var updateIssue = async (id, payload, user) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issueResult.rows.length === 0) {
    return null;
  }
  const issue = issueResult.rows[0];
  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;
  if (!isMaintainer) {
    if (!isOwner || issue.status !== "open") {
      return {
        error: "FORBIDDEN"
      };
    }
  }
  const fields = [];
  const values = [];
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
var deleteIssue = async (id) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issueResult.rows.length === 0) {
    return null;
  }
  await pool.query(
    `DELETE FROM issues WHERE id = $1`,
    [id]
  );
  return true;
};
var issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.controller.ts
var createIssue2 = async (req, res) => {
  const result = await issueService.createIssue(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: "Issue created successfully",
    data: result
  });
};
var getAllIssues2 = async (req, res) => {
  const result = await issueService.getAllIssues(req.query);
  res.status(200).json({
    success: true,
    message: "Issues retrived successfully",
    data: result
  });
};
var getSingleIssue2 = async (req, res) => {
  const id = Number(req.params.id);
  const result = await issueService.getSingleIssue(id);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not found"
    });
  }
  res.status(200).json({
    success: true,
    message: "Issue retrived successfully",
    data: result
  });
};
var updateIssue2 = async (req, res) => {
  const id = Number(req.params.id);
  const result = await issueService.updateIssue(id, req.body, req.user);
  if (result?.error === "FORBIDDEN") {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to update this issue"
    });
  }
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not found"
    });
  }
  return res.status(200).json({
    success: true,
    message: "Issue updated successfully",
    data: result
  });
};
var deleteIssue2 = async (req, res) => {
  const id = Number(req.params.id);
  const result = await issueService.deleteIssue(id);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not found"
    });
  }
  return res.status(200).json({
    success: true,
    message: "Issue deleted successfully"
  });
};
var issueController = {
  createIssue: createIssue2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/modules/issue/issue.route.ts
var router4 = Router4();
router4.post("/", auth_middleware_default(), issueController.createIssue);
router4.get("/", issueController.getAllIssues);
router4.get("/:id", issueController.getSingleIssue);
router4.patch("/:id", auth_middleware_default(), issueController.updateIssue);
router4.delete("/:id", auth_middleware_default("maintainer"), issueController.deleteIssue);
var issueRoute = router4;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/user", (req, res) => {
  res.status(200).json({
    message: "Assignment 2",
    author: "Next Level Assignment"
  });
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = async () => {
  await initDB();
  app_default.listen(port, () => {
    console.log(`app is listening port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map