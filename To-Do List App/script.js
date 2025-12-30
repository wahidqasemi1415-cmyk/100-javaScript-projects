// DOM Elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');

// State
let todos = [];
let currentFilter = 'all';

// Initialize the app
function init() {
    loadTodos();
    renderTodos();
    setupEventListeners();
}

// Load todos from localStorage
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateStats();
}

// Update task statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    
    totalTasksEl.textContent = `Total: ${total} ${total === 1 ? 'task' : 'tasks'}`;
    completedTasksEl.textContent = `Completed: ${completed}`;
}

// Render todos based on current filter
function renderTodos() {
    // Clear current list
    todoList.innerHTML = '';
    
    // Filter todos
    let filteredTodos = [];
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else {
        filteredTodos = todos;
    }
    
    // If no todos, show empty state
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <p>No ${currentFilter !== 'all' ? currentFilter : ''} tasks found</p>
            <p>${currentFilter === 'all' ? 'Add your first task above!' : ''}</p>
        `;
        todoList.appendChild(emptyState);
        updateStats();
        return;
    }
    
    // Create todo items
    filteredTodos.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.className = 'todo-item';
        todoItem.dataset.id = todo.id;
        
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <div class="todo-actions">
                <button class="edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        todoList.appendChild(todoItem);
        
        // Add event listeners to the new todo item
        const checkbox = todoItem.querySelector('.todo-checkbox');
        const editBtn = todoItem.querySelector('.edit-btn');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        const todoText = todoItem.querySelector('.todo-text');
        
        // Toggle completion
        checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id));
        
        // Edit task
        editBtn.addEventListener('click', () => editTodo(todo.id, todoText));
        
        // Double-click to edit
        todoText.addEventListener('dblclick', () => editTodo(todo.id, todoText));
        
        // Delete task
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    });
    
    updateStats();
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        showNotification('Please enter a task', 'error');
        return;
    }
    
    const newTodo = {
        id: Date.now(), // Simple unique ID
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    
    // Clear input and focus
    todoInput.value = '';
    todoInput.focus();
    
    showNotification('Task added successfully!', 'success');
}

// Toggle todo completion
function toggleTodoCompletion(id) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        saveTodos();
        renderTodos();
        
        const status = todos[todoIndex].completed ? 'completed' : 'marked as active';
        showNotification(`Task ${status}!`, 'info');
    }
}

// Edit a todo
function editTodo(id, todoTextElement) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) return;
    
    const currentText = todos[todoIndex].text;
    const newText = prompt('Edit your task:', currentText);
    
    if (newText !== null && newText.trim() !== '') {
        if (newText.trim() !== currentText) {
            todos[todoIndex].text = newText.trim();
            saveTodos();
            renderTodos();
            showNotification('Task updated successfully!', 'success');
        }
    }
}

// Delete a todo
function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex !== -1) {
        const deletedText = todos[todoIndex].text;
        todos.splice(todoIndex, 1);
        saveTodos();
        renderTodos();
        showNotification(`"${deletedText}" deleted!`, 'error');
    }
}

// Filter todos
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set color based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(to right, #4CAF50, #45a049)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(to right, #f44336, #d32f2f)';
    } else if (type === 'info') {
        notification.style.background = 'linear-gradient(to right, #2196F3, #1976D2)';
    }
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        
        const slideOutStyle = document.createElement('style');
        slideOutStyle.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(slideOutStyle);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Set up event listeners
function setupEventListeners() {
    // Add todo on button click
    addBtn.addEventListener('click', addTodo);
    
    // Add todo on Enter key
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
    
    // Initialize with some sample todos if empty
    if (todos.length === 0) {
        const sampleTodos = [
            { id: 1, text: "Learn JavaScript fundamentals", completed: true },
            { id: 2, text: "Build a To-Do List app", completed: false },
            { id: 3, text: "Explore DOM manipulation", completed: false },
            { id: 4, text: "Practice CSS styling", completed: false }
        ];
        
        // Only add sample todos if localStorage is empty
        if (!localStorage.getItem('todos')) {
            todos = sampleTodos;
            saveTodos();
            renderTodos();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);