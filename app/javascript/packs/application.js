// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"

Rails.start()
Turbolinks.start()
ActiveStorage.start()

// app/javascript/packs/application.js

document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 1; // Replace with dynamic user ID if implemented

  // Fetch and render tasks on page load
  fetchTasks(apiKey, 'all');

  // Handle form submission to add a new task
  const addTaskForm = document.getElementById('add-task-form');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', event => {
      event.preventDefault();
      const contentInput = document.getElementById('new-task-content');
      const content = contentInput.value.trim();

      if (content === '') return;

      addTask(apiKey, content).then(() => {
        // After adding a task, refetch tasks based on the current filter
        const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        fetchTasks(apiKey, currentFilter);
      });
    });
  }

  // Handle filter button clicks using event delegation
  const filters = document.getElementById('filters');
  if (filters) {
    filters.addEventListener('click', event => {
      if (event.target.tagName === 'BUTTON') {
        const filter = event.target.dataset.filter;
        // Highlight the active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    
        // Fetch tasks again to ensure latest data
        fetchTasks(apiKey, filter);
      }
    });
  }
});

/**
 * Fetch tasks from the API and render them based on the filter.
 * @param {number} apiKey - The user's API key.
 * @param {string} filter - The filter to apply ('all', 'active', 'complete').
 */
function fetchTasks(apiKey, filter) {
  fetch(`/api/tasks?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.tasks) {
        applyFilterLocally(data.tasks, filter);
      }
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

/**
 * Add a new task via the API.
 * @param {number} apiKey - The user's API key.
 * @param {string} content - The content of the new task.
 * @returns {Promise} - Resolves when the task is added.
 */
function addTask(apiKey, content) {
  return fetch(`/api/tasks?api_key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      task: {
        content: content,
        due: new Date().toISOString()
      }
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.task) {
        console.log('Task added:', data.task);
      } else if (data.errors) {
        console.error('Error adding task:', data.errors);
        alert(`Error: ${data.errors.join(', ')}`);
      }
    })
    .catch(error => console.error('Error adding task:', error));
}

/**
 * Remove a task via the API.
 * @param {number} taskId - The ID of the task to remove.
 */
function removeTask(taskId) {
  const apiKey = 1; // Replace with dynamic user ID if implemented

  fetch(`/api/tasks/${taskId}?api_key=${apiKey}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Remove the task from the DOM
        const taskItem = document.querySelector(`li[data-id='${taskId}']`);
        if (taskItem) {
          taskItem.remove();
        }
      } else if (data.errors) {
        console.error('Error removing task:', data.errors);
        alert(`Error: ${data.errors.join(', ')}`);
      }
    })
    .catch(error => console.error('Error removing task:', error));
}

/**
 * Toggle the completion status of a task via the API and update the DOM.
 * @param {number} taskId - The ID of the task to toggle.
 * @param {boolean} currentStatus - The current completion status of the task.
 */
function toggleTaskComplete(taskId, currentStatus) {
  const apiKey = 1; // Replace with dynamic user ID if implemented
  const method = currentStatus ? 'mark_active' : 'mark_complete';
  const url = `/api/tasks/${taskId}/${method}?api_key=${apiKey}`;

  console.log(`Toggling task ${taskId} to ${method}`);

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log('API Response:', data);
      if (data.task) {
        updateTaskInDOM(data.task);
      } else if (data.errors) {
        console.error('Error toggling task status:', data.errors);
        alert(`Error: ${data.errors.join(', ')}`);
      }
    })
    .catch(error => console.error('Error toggling task status:', error));
}

/**
 * Update a task's representation in the DOM.
 * @param {Object} task - The updated task object.
 */
function updateTaskInDOM(task) {
  console.log('Updating DOM for task:', task);

  const taskItem = document.querySelector(`li[data-id='${task.id}']`);
  if (!taskItem) {
    console.error(`Task item with id ${task.id} not found in DOM.`);
    return;
  }

  const taskContent = taskItem.querySelector('span');
  taskContent.textContent = task.content;
  taskContent.className = task.complete ? 'completed' : '';

  const toggleButton = taskItem.querySelector('.toggle-complete-btn');
  toggleButton.textContent = task.complete ? 'Mark Active' : 'Mark Complete';
  // Update the event listener with the new status
  toggleButton.replaceWith(toggleButton.cloneNode(true)); // Remove existing listeners
  const newToggleButton = taskItem.querySelector('.toggle-complete-btn');
  newToggleButton.addEventListener('click', () => toggleTaskComplete(task.id, task.complete));
}

/**
 * Apply filter locally without re-fetching from the API.
 * @param {Array} tasks - Array of task objects.
 * @param {string} filter - The filter to apply ('all', 'active', 'complete').
 */
function applyFilterLocally(tasks, filter) {
  let filteredTasks = [];

  switch (filter) {
    case 'active':
      filteredTasks = tasks.filter(task => task.complete === false);
      break;
    case 'complete':
      filteredTasks = tasks.filter(task => task.complete === true);
      break;
    case 'all':
    default:
      filteredTasks = tasks;
      break;
  }

  renderTasks(filteredTasks);
}

/**
 * Render a list of tasks in the DOM.
 * @param {Array} tasks - An array of task objects.
 */
function renderTasks(tasks) {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  taskList.innerHTML = ''; // Clear existing tasks

  tasks.forEach(task => {
    const taskItem = createTaskElement(task);
    taskList.appendChild(taskItem);
  });
}

/**
 * Create a DOM element for a single task.
 * @param {Object} task - The task object.
 * @returns {HTMLElement} - The list item element representing the task.
 */
function createTaskElement(task) {
  const taskItem = document.createElement('li');
  taskItem.className = 'task-item';
  taskItem.dataset.id = task.id;

  // Task Content
  const taskContent = document.createElement('span');
  taskContent.textContent = task.content;
  taskContent.className = task.complete ? 'completed' : '';

  // Remove Button
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.className = 'remove-btn';
  removeButton.addEventListener('click', () => removeTask(task.id));

  // Toggle Complete/Active Button
  const toggleCompleteButton = document.createElement('button');
  toggleCompleteButton.textContent = task.complete ? 'Mark Active' : 'Mark Complete';
  toggleCompleteButton.className = 'toggle-complete-btn';
  toggleCompleteButton.addEventListener('click', () => toggleTaskComplete(task.id, task.complete));

  // Append elements to taskItem
  taskItem.appendChild(taskContent);
  taskItem.appendChild(removeButton);
  taskItem.appendChild(toggleCompleteButton);

  return taskItem;
}