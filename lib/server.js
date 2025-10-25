import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";
import fs from "fs";
import chalk from "chalk";
import {
  ensureRepoInit,
  getAllTodos,
  getTodoById,
  addTodo,
  updateTodo,
  deleteTodo,
  readTodoDetailFile,
  writeTodoDetailFile,
  calculateProgress
} from "./file-utils.js";
import { STATUS } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer(cwd, port = 3456) {
  // Ensure initialized
  await ensureRepoInit(cwd);

  const app = express();
  const distPath = path.join(__dirname, "../dist");

  // Check dist exists
  if (!fs.existsSync(distPath)) {
    console.log(chalk.red("❌ Error: dist folder not found!"));
    console.log(chalk.yellow("Please run 'pnpm build' first."));
    process.exit(1);
  }

  // Middleware
  app.use(express.json());

  // CORS for development
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // API Routes

  // GET /api/todos - Get all todos
  app.get("/api/todos", (req, res) => {
    try {
      const todos = getAllTodos(cwd);

      // Add progress calculation
      const todosWithProgress = todos.map(todo => ({
        ...todo,
        progress: calculateProgress(todo.checklist)
      }));

      res.json({ success: true, todos: todosWithProgress });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/todos/:id - Get single todo
  app.get("/api/todos/:id", (req, res) => {
    try {
      const { id } = req.params;
      const todo =getTodoById(cwd, id);

      if (!todo) {
        return res.status(404).json({ success: false, error: "Todo not found" });
      }

      // Load detail file if exists
      let detailContent = null;
      if (todo.hasDetailFile) {
        detailContent = readTodoDetailFile(cwd, id);
      }

      res.json({
        success: true,
        todo: {
          ...todo,
          progress: calculateProgress(todo.checklist),
          detailContent
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/todos - Create new todo
  app.post("/api/todos", (req, res) => {
    try {
      const { title, description, expected, tags, checklist } = req.body;

      const todoData = {
        title: title || "Untitled Todo",
        description: description || "",
        expected: expected || "",
        tags: tags || [],
        checklist: checklist || []
      };

      const newTodo = addTodo(cwd, todoData);

      res.json({ success: true, todo: newTodo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/todos/:id - Update todo
  app.put("/api/todos/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updates = {};

      // Only include provided fields
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.status !== undefined) updates.status = req.body.status;
      if (req.body.expected !== undefined) updates.expected = req.body.expected;
      if (req.body.tags !== undefined) updates.tags = req.body.tags;
      if (req.body.checklist !== undefined) updates.checklist = req.body.checklist;

      const updatedTodo = updateTodo(cwd, id, updates);

      if (!updatedTodo) {
        return res.status(404).json({ success: false, error: "Todo not found" });
      }

      res.json({ success: true, todo: updatedTodo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/todos/:id - Delete todo
  app.delete("/api/todos/:id", (req, res) => {
    try {
      const { id } = req.params;

      const success = deleteTodo(cwd, id);

      if (!success) {
        return res.status(404).json({ success: false, error: "Todo not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/todos/:id/move - Move todo to different status
  app.post("/api/todos/:id/move", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = Object.values(STATUS);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Use: ${validStatuses.join(", ")}`
        });
      }

      const updatedTodo = updateTodo(cwd, id, { status });

      if (!updatedTodo) {
        return res.status(404).json({ success: false, error: "Todo not found" });
      }

      res.json({ success: true, todo: updatedTodo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/todos/:id/detail - Update todo detail file
  app.put("/api/todos/:id/detail", (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ success: false, error: "Content is required" });
      }

      const todo =getTodoById(cwd, id);
      if (!todo) {
        return res.status(404).json({ success: false, error: "Todo not found" });
      }

      writeTodoDetailFile(cwd, id, content);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Serve static files (React app)
  app.use(express.static(distPath));

  // SPA fallback
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // Start server
  const server = app.listen(port, () => {
    const url = `http://localhost:${port}`;

    console.log("");
    console.log(chalk.blue("╔═══════════════════════════════════════╗"));
    console.log(chalk.blue("║") + chalk.bold("   📋 VTodo - Todo Manager             ") + chalk.blue("║"));
    console.log(chalk.blue("╚═══════════════════════════════════════╝"));
    console.log("");
    console.log(chalk.green("✨ Server running at:"), chalk.cyan(url));
    console.log(chalk.gray("   Working directory:"), cwd);
    console.log(chalk.gray("   Storage: .vtodo/todos.json"));
    console.log("");
    console.log(chalk.yellow("📝 Next steps:"));
    console.log(chalk.gray("   • Browser will open automatically"));
    console.log(chalk.gray("   • Manage todos visually in the web UI"));
    console.log(chalk.gray("   • Or use CLI: vtodo add, vtodo list, etc."));
    console.log("");
    console.log(chalk.gray("Press Ctrl+C to stop the server"));
    console.log("");

    // Auto-open browser (don't await)
    open(url).catch(() => {
      console.log(chalk.yellow("⚠️  Could not open browser automatically"));
      console.log(chalk.gray(`   Please open ${url} manually`));
    });
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log(chalk.gray("\n👋 Shutting down gracefully..."));
    server.close(() => {
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log(chalk.gray("\n👋 Shutting down gracefully..."));
    server.close(() => {
      process.exit(0);
    });
  });

  // Return a promise that never resolves to keep the process running
  return new Promise(() => {});
}
