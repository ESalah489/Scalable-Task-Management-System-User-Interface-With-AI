import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
  });
  const [isLoading, setIsLoading] = useState(false);

  const statusColors = {
    pending: '🟡 pending',
    'in-progress': '🔵 in-progress',
    completed: '✅ completed',
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await onUpdate(task.id, { ...editData, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(task.id, editData);
      toast.success('Task updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await onDelete(task.id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isEditing) {
    return (
      <div className="task-card editing">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          placeholder="Title"
          className="edit-input"
        />
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          placeholder="Description"
          className="edit-textarea"
        />
        <select
          value={editData.status}
          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
          className="edit-select"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div className="task-actions">
          <button onClick={handleSave} disabled={isLoading} className="save-btn">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => setIsEditing(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`status-badge status-${task.status}`}>
          {statusColors[task.status]}
        </span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <small>Created: {formatDate(task.createdAt)}</small>
      </div>
      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isLoading}
          className="status-select"
        >
          <option value="pending">🟡 Pending</option>
          <option value="in-progress">🔵 In Progress</option>
          <option value="completed">✅ Completed</option>
        </select>
        <button onClick={() => setIsEditing(true)} className="edit-btn">
          ✏️ Edit
        </button>
        <button onClick={handleDelete} disabled={isLoading} className="delete-btn">
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;