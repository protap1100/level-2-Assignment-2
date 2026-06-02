import express, {
  type Application,
  type Request,
  type Response,
} from "express";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/user", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express sever",
    author: "Next level",
  });
});


export default app;
