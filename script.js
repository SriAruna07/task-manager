let tasks = [];

const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const dateInput = document.getElementById("dateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");


// ===============================
// LOGIN & REGISTER
// ===============================

const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");


// Show Register Page
showRegister.addEventListener("click", function (event) {

    event.preventDefault();

    loginPage.style.display = "none";
    registerPage.style.display = "flex";

});


// Show Login Page
showLogin.addEventListener("click", function (event) {

    event.preventDefault();

    registerPage.style.display = "none";
    loginPage.style.display = "flex";

});


// ===============================
// REGISTER
// ===============================

const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async function () {

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (name === "" || email === "" || password === "") {

        alert("Please fill in all fields.");
        return;

    }

    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);
            return;

        }

        alert("Registration successful! Please login.");

        document.getElementById("registerName").value = "";
        document.getElementById("registerEmail").value = "";
        document.getElementById("registerPassword").value = "";

        registerPage.style.display = "none";
        loginPage.style.display = "flex";

    }

    catch (error) {

        console.error("Registration error:", error);

        alert("Could not connect to the server.");

    }

});


// ===============================
// LOGIN
// ===============================

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async function () {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email === "" || password === "") {

        alert("Please enter your email and password.");
        return;

    }

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);
            return;

        }

        alert(`Welcome, ${data.user.name}!`);
        sessionStorage.setItem("loggedIn", "true");
sessionStorage.setItem("userName", data.user.name);

        loginPage.style.display = "none";

        document.querySelector(".container").style.display = "block";

        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";

        loadTasks();

    }

    catch (error) {

        console.error("Login error:", error);

        alert("Could not connect to the server.");

    }

});


// ===============================
// ADD TASK
// ===============================

addTaskBtn.addEventListener("click", addTask);


async function addTask() {

    const taskName = taskInput.value.trim();
    const subject = subjectInput.value.trim();
    const date = dateInput.value;

    if (taskName === "" || subject === "" || date === "") {

        alert("Please fill in all fields.");
        return;

    }

    const task = {

        name: taskName,
        subject: subject,
        date: date,
        completed: false

    };

    try {

        const response = await fetch("/api/tasks", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(task)

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Failed to add task");

        }

        tasks.push(data.task);

        taskInput.value = "";
        subjectInput.value = "";
        dateInput.value = "";

        displayTasks();

    }

    catch (error) {

        console.error("Error:", error);

        alert("Could not save the task.");

    }

}


// ===============================
// LOAD TASKS FROM MONGODB
// ===============================

async function loadTasks() {

    try {

        const response = await fetch("/api/tasks");

        const data = await response.json();

        if (!response.ok) {

            throw new Error("Failed to load tasks");

        }

        tasks = data;

        displayTasks();

    }

    catch (error) {

        console.error("Error loading tasks:", error);

    }

}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks() {

    taskList.innerHTML = "";

    tasks.forEach(function (task) {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        taskCard.innerHTML = `

            <h3>${task.name}</h3>

            <p>
                <strong>Subject:</strong>
                ${task.subject}
            </p>

            <p>
                <strong>Due Date:</strong>
                ${task.date}
            </p>

            <p>
                <strong>Status:</strong>
                ${task.completed ? "Completed" : "Pending"}
            </p>

            <button
                class="complete-btn"
                onclick="completeTask('${task._id}')"
            >
                ${task.completed ? "Completed" : "Mark Complete"}
            </button>

            <button
                class="edit-btn"
                onclick="editTask('${task._id}')"
            >
                Edit
            </button>

            <button
                class="delete-btn"
                onclick="deleteTask('${task._id}')"
            >
                Delete
            </button>

        `;

        taskList.appendChild(taskCard);

    });

    updateStats();

}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {

        return task.completed === true;

    }).length;

    const pending = total - completed;

    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;

}


// ===============================
// COMPLETE / UNCOMPLETE TASK
// ===============================

async function completeTask(id) {

    const task = tasks.find(function (task) {

        return task._id === id;

    });

    if (!task) {

        return;

    }

    try {

        const response = await fetch(`/api/tasks/${id}`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                completed: !task.completed

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Failed to update task");

        }

        const index = tasks.findIndex(function (task) {

            return task._id === id;

        });

        tasks[index] = data.task;

        displayTasks();

    }

    catch (error) {

        console.error("Error updating task:", error);

        alert("Could not update task.");

    }

}


// ===============================
// EDIT TASK
// ===============================

async function editTask(id) {

    const task = tasks.find(function (task) {

        return task._id === id;

    });

    if (!task) {

        return;

    }

    const newTaskName = prompt(
        "Enter updated task:",
        task.name
    );

    if (
        newTaskName === null ||
        newTaskName.trim() === ""
    ) {

        return;

    }

    const newSubject = prompt(
        "Enter updated subject:",
        task.subject
    );

    if (
        newSubject === null ||
        newSubject.trim() === ""
    ) {

        return;

    }

    try {

        const response = await fetch(`/api/tasks/${id}`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                name: newTaskName.trim(),

                subject: newSubject.trim()

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to update task"
            );

        }

        const index = tasks.findIndex(function (task) {

            return task._id === id;

        });

        tasks[index] = data.task;

        displayTasks();

    }

    catch (error) {

        console.error("Error editing task:", error);

        alert("Could not update task.");

    }

}


// ===============================
// DELETE TASK
// ===============================

async function deleteTask(id) {

    try {

        const response = await fetch(`/api/tasks/${id}`, {

            method: "DELETE"

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to delete task"
            );

        }

        tasks = tasks.filter(function (task) {

            return task._id !== id;

        });

        displayTasks();

    }

    catch (error) {

        console.error("Error deleting task:", error);

        alert("Could not delete task.");

    }

}

// ===============================
// LOGOUT
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {

    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("userName");

    document.querySelector(".container").style.display = "none";

    loginPage.style.display = "flex";

    alert("Logged out successfully.");

});
// ===============================
// CHECK LOGIN SESSION
// ===============================

if (sessionStorage.getItem("loggedIn") === "true") {

    loginPage.style.display = "none";
    document.querySelector(".container").style.display = "block";

    loadTasks();

}