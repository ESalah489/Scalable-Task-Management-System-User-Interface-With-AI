import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, loading, onUpdate, onDelete }) => {
  if (loading) {
    return (
      <div className="loading-spinner">
        <div>⏳ Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;