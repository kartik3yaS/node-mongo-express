const express = require('express');
const mongoose = require('mongoose');
const TodoTask = require('./models/TodoTask');
require('dotenv').config();

const app = express();

app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));

const dbPassword = process.env.DB_PASS;
mongoose.connect(`mongodb+srv://kartikeyashukla009:${dbPassword}@cluster0.lnvzawa.mongodb.net/todo?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        console.log("db connected");
        app.listen(3000, () => {
            console.log("server running");
        });
    })
    .catch(err => {
        console.error("DB connection error:", err);
    });

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    try {
        const tasks = await TodoTask.find({});
        res.render("todo.ejs", { todoTasks: tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send("Error fetching tasks");
    }
});

// POST route to add a new task
app.post("/", async (req, res) => {
    const todoTask = new TodoTask({
        content: req.body.content
    });
    try {
        await todoTask.save();
        res.redirect('/');
    } catch (err) {
        console.error("Error saving task:", err);
        res.redirect('/');
    }
});

app.route("/edit/:id")
    .get(async (req, res) => {
        try {
            const id = req.params.id; // Get the task ID from the URL
            const tasks = await TodoTask.find({}); // Fetch all tasks
            res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id }); // Render the template with tasks and the ID of the task being edited
        } catch (err) {
            console.error("Error fetching tasks:", err);
            res.status(500).send("Error fetching tasks");
        }
    })
    .post(async (req, res) => {
        try {
            const id = req.params.id; // Get the task ID from the URL
            await TodoTask.findByIdAndUpdate(id, { content: req.body.content }); // Update the task content
            res.redirect("/"); // Redirect to the homepage after updating
        } catch (err) {
            console.error("Error updating task:", err);
            res.status(500).send("Error updating task");
        }
    });

app.route("/remove/:id").get(async(req, res) => {
    try{
        const id=req.params.id;
        await TodoTask.findByIdAndDelete(id);
        res.redirect("/");
    }catch(err){
        res.status(500).send("error deleting task");
    }
});