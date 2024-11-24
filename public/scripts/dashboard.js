const API_BASE_URL = 'http://localhost/project/api';
const projectsContainer = document.getElementById('projects-container');
const addProjectButton = document.getElementById('add-project-button');
const projectNameInput = document.getElementById('project-name-input');
const globalTimerDisplay = document.getElementById('global-timer-display');

let timerInterval = null; // Глобальний інтервал для таймера
let activeProjectId = null; // ID активного проекту для таймера
let elapsedSeconds = 0; // Час у секундах

// Отримання userId з localStorage
const userId = localStorage.getItem('userId');
if (!userId) {
    alert('You are not logged in. Redirecting to login page.');
    window.location.href = 'index.html';
}

// Завантаження проектів після завантаження сторінки
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/projects.php?userId=${userId}`);
        const projects = await response.json();

        if (Array.isArray(projects)) {
            for (const project of projects) {
                const projectCard = addProjectCard({
                    projectId: project.ProjectID,
                    projectName: project.ProjectName,
                    isCompleted: project.IsCompleted,
                    totalTime: project.TotalTime || 0,
                });
                await loadTasksForProject(project.ProjectID, projectCard);
            }
        } else {
            alert('Failed to load projects: ' + (projects.error || 'Unknown error'));
        }
    } catch (error) {
        alert('An error occurred while loading projects.');
    }
});

// Додавання нового проекту
addProjectButton.addEventListener('click', async () => {
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
        alert('Project name cannot be empty.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/projects.php?action=create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, projectName }),
        });
        const result = await response.json();

        if (result.success) {
            const projectCard = addProjectCard({
                projectId: result.projectId,
                projectName,
                isCompleted: false,
                totalTime: 0,
            });
            await loadTasksForProject(result.projectId, projectCard);
            projectNameInput.value = '';
        } else {
            alert('Failed to add project: ' + result.error);
        }
    } catch (error) {
        alert('An error occurred while adding the project.');
    }
});

// Завантаження завдань для проекту
async function loadTasksForProject(projectId, projectElement) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks.php?projectId=${projectId}`);
        const tasks = await response.json();

        if (Array.isArray(tasks) && tasks.length > 0) {
            const taskSelector = projectElement.querySelector('.task-selector');
            tasks.forEach(task => {
                const option = document.createElement('option');
                option.value = task.TaskID;
                option.textContent = task.TaskName;
                taskSelector.appendChild(option);
            });

            // Вибір першого таска як активного
            taskSelector.value = tasks[0].TaskID;
        } else {
            console.error('No tasks found or failed to load tasks:', tasks.error || 'Unknown error');
        }
    } catch (error) {
        console.error('An error occurred while loading tasks:', error);
    }
}


// Додавання картки проекту
function addProjectCard({ projectId, projectName, isCompleted, totalTime }) {
    const projectElement = document.createElement('div');
    projectElement.className = 'project';

    projectElement.innerHTML = `
        <div class="project-header">
            <span class="project-name">${projectName}</span>
            <button class="btn btn-danger delete-project"><img src="images/trash.svg" alt="Del" class="icon"></button>
        </div>
        <div class="project-body">
            <select class="task-selector" ${isCompleted ? 'disabled' : ''}>
                <option value="" disabled selected>Select Task</option>
            </select>
            <button class="btn btn-secondary add-task" ${isCompleted ? 'disabled' : ''}><img src="images/plus.svg" alt="Add" class="icon"></button>
            <div class="timer-display">${formatTime(totalTime)}</div>
            <button class="btn btn-secondary start-timer" ${isCompleted ? 'disabled' : ''}><img src="images/play.svg" alt="Start" class="icon"></button>
            <button class="btn btn-secondary stop-timer" ${isCompleted ? 'disabled' : ''} disabled><img src="images/stop.svg" alt="Stop" class="icon"></button>
            <label>
                <input type="checkbox" class="mark-completed" ${isCompleted ? 'checked' : ''} />
                ${isCompleted ? 'Finished' : 'Finish'}
            </label>
        </div>
    `;

    projectsContainer.appendChild(projectElement);
    initializeProject({ projectElement, projectId, totalTime, isCompleted });
    return projectElement;
}


// Ініціалізація проекту
function initializeProject({ projectElement, projectId, totalTime, isCompleted }) {
    const deleteButton = projectElement.querySelector('.delete-project');
    const addTaskButton = projectElement.querySelector('.add-task');
    const startTimerButton = projectElement.querySelector('.start-timer');
    const stopTimerButton = projectElement.querySelector('.stop-timer');
    const markCompletedCheckbox = projectElement.querySelector('.mark-completed');
    const timerDisplay = projectElement.querySelector('.timer-display');

    deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete this project?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/projects.php?action=delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, userId }),
            });
            const result = await response.json();

            if (result.success) {
                projectElement.remove();
                alert('Project successfully deleted.');
            } else {
                alert('Failed to delete project: ' + result.error);
            }
        } catch (error) {
            alert('An error occurred while deleting the project.');
        }
    });

    addTaskButton.addEventListener('click', async () => {
        const taskName = prompt('Enter task name:');
        if (!taskName) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tasks.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, taskName }),
            });
            const result = await response.json();

            if (result.success) {
                const option = document.createElement('option');
                option.value = result.taskId;
                option.textContent = taskName;
                const taskSelector = projectElement.querySelector('.task-selector');
                taskSelector.appendChild(option);
            } else {
                alert('Failed to add task: ' + result.error);
            }
        } catch (error) {
            alert('An error occurred while adding the task.');
        }
    });

    markCompletedCheckbox.addEventListener('change', async () => {
        const isChecked = markCompletedCheckbox.checked;
        const label = markCompletedCheckbox.parentNode; // Безпечний спосіб вибрати батька
    
        try {
            const response = await fetch(`${API_BASE_URL}/projects.php`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    projectId, 
                    isCompleted: isChecked 
                }),
            });
            const result = await response.json();
    
            if (result.success) {
                if (label) {
                    label.innerHTML = isChecked 
                        ? `<input type="checkbox" class="mark-completed" checked /> Finished`
                        : `<input type="checkbox" class="mark-completed" /> Finish`;
                }
                // Деактивація елементів для завершеного проекту
                addTaskButton.disabled = isChecked;
                startTimerButton.disabled = isChecked;
                stopTimerButton.disabled = isChecked;
                const taskSelector = projectElement.querySelector('.task-selector');
                if (taskSelector) taskSelector.disabled = isChecked;
            } else {
                throw new Error(result.error || 'Failed to update project completion status.');
            }
        } catch (error) {
            alert(error.message);
            markCompletedCheckbox.checked = !isChecked; // Повернути стан
        }
    });
    

    startTimerButton.addEventListener('click', () => {
        if (timerInterval) {
            alert('A timer is already running. Please stop it first.');
            return;
        }
        activeProjectId = projectId;
        elapsedSeconds = 0;
        globalTimerDisplay.textContent = formatTime(elapsedSeconds);
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            globalTimerDisplay.textContent = formatTime(elapsedSeconds);
        }, 1000);
        startTimerButton.disabled = true;
        stopTimerButton.disabled = false;
    });

    stopTimerButton.addEventListener('click', async () => {
        if (!timerInterval) return;

        clearInterval(timerInterval);
        timerInterval = null;

        const newTotalTime = totalTime + elapsedSeconds;
        timerDisplay.textContent = formatTime(newTotalTime);

        try {
            await fetch(`${API_BASE_URL}/projects.php?action=updateTime`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, projectId, totalTime: newTotalTime }),
            });
        } catch (error) {
            alert('Failed to save project time.');
        }

        elapsedSeconds = 0;
        globalTimerDisplay.textContent = '00:00:00';
        activeProjectId = null;

        startTimerButton.disabled = false;
        stopTimerButton.disabled = true;
    });
}

// Форматування часу
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
