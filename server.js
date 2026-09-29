const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Task = require("./Task");
const User = require("./user");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "Task Manager backend is working!"
    });
});

// Create a new task
app.post("/api/tasks", async (req, res) => {

    try {
        const task = new Task(req.body);

        const savedTask = await task.save();

        res.status(201).json({
            message: "Task saved successfully!",
            task: savedTask
        });

    } catch (error) {
        console.error("Error saving task:", error);

        res.status(500).json({
            message: "Failed to save task."
        });
    }
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {

    try {
        const tasks = await Task.find();

        res.json(tasks);

    } catch (error) {
        console.error("Error fetching tasks:", error);

        res.status(500).json({
            message: "Failed to fetch tasks."
        });
    }
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json({
            message: "Task updated successfully!",
            task: updatedTask
        });

    } catch (error) {
        console.error("Error updating task:", error);

        res.status(500).json({
            message: "Failed to update task."
        });
    }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {

    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json({
            message: "Task deleted successfully!"
        });

    } catch (error) {
        console.error("Error deleting task:", error);

        res.status(500).json({
            message: "Failed to delete task."
        });
    }
});

// Register user
app.post("/api/register", async (req, res) => {

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful!"
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed."
        });
    }
});

// Login user
app.post("/api/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});