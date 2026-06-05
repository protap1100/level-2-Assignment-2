import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issue/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Assignment 2(Next Level assignment)",
    author: "Protap Biswas",
  });
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);

export default app;
