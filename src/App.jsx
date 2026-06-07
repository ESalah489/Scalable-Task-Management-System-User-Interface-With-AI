import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import SearchBar from './components/SearchBar';
import StatusFilter from './components/StatusFilter';
import Pagination from './components/Pagination';

import useWebSocket from './hooks/useWebSocket';

import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  filterTasksByStatus,
  searchTasks,
} from './services/api';

import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 10;

  const fetchTasks = async (
    page = currentPage,
    filter = currentFilter,
    search = searchQuery
  ) => {
    setLoading(true);

    try {
      let response;

      console.log('Fetching:', {
        page,
        filter,
        search,
      });

      if (search && search.trim() !== '') {
        response = await searchTasks(search, page, itemsPerPage);
      }

      else if (filter !== 'all') {
        response = await filterTasksByStatus(
          filter,
          page,
          itemsPerPage
        );
      }

      else {
        response = await getAllTasks(page, itemsPerPage);
      }

      const { tasks: fetchedTasks, pagination } =
        response.data.data;

      setTasks(fetchedTasks);

      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.totalItems || 0);
    } catch (error) {
      console.error('Error fetching tasks:', error);

      setTasks([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(currentPage, currentFilter, searchQuery);
  }, [currentPage, currentFilter, searchQuery]);

  const handleWebSocketUpdate = async (updatedTask) => {
    console.log('WebSocket update:', updatedTask);

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );

    await fetchTasks(
      currentPage,
      currentFilter,
      searchQuery
    );
  };

  const handleWebSocketDelete = async (deletedTaskId) => {
    console.log('WebSocket delete:', deletedTaskId);

    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== deletedTaskId)
    );

    await fetchTasks(
      currentPage,
      currentFilter,
      searchQuery
    );
  };

  useWebSocket(
    handleWebSocketUpdate,
    handleWebSocketDelete
  );

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);

      await fetchTasks(
        1,
        currentFilter,
        searchQuery
      );
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await updateTask(id, taskData);

      await fetchTasks(
        currentPage,
        currentFilter,
        searchQuery
      );
    } catch (error) {
      console.error('Update task error:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);

      await fetchTasks(
        currentPage,
        currentFilter,
        searchQuery
      );
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const handleFilterChange = (filter) => {
    console.log('Selected Filter:', filter);

    setCurrentFilter(filter);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    console.log('Search Query:', query);

    setSearchQuery(query);
    setCurrentFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      <Toaster position="top-right" />

      <header className="app-header">
        <h1>📋 Task Management System</h1>

        <p>
          Real-time updates with WebSocket |
          Clean Architecture
        </p>
      </header>

      <div className="container">

        <div className="sidebar">

          <TaskForm onCreate={handleCreateTask} />

          <div className="stats">
            <h3>Statistics</h3>

            <div className="stat-item">
              <span>📊 Total Tasks:</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="stat-item">
              <span>📄 Current Page:</span>

              <strong>
                {currentPage} / {totalPages}
              </strong>
            </div>

            <div className="stat-item">
              <span>🟢 Real-time:</span>

              <strong className="online-status">
                Connected
              </strong>
            </div>
          </div>
        </div>

        <div className="main-content">

          <div className="controls">

            <SearchBar
              onSearch={handleSearch}
              isLoading={loading}
            />

            <StatusFilter
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
          </div>

          <TaskList
            tasks={tasks}
            loading={loading}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />

          {!loading && tasks.length === 0 && (
            <div className="empty-state">
              <p>📭 No tasks found</p>

              <small>
                Create your first task using the
                form
              </small>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;