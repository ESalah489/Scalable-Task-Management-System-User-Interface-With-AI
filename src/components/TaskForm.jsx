import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TaskForm = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(formData);
      toast.success('Task created successfully');
      setFormData({ title: '', description: '', status: 'pending' });
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>Create New Task</h2>
      <input
        type="text"
        placeholder="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="form-input"
        disabled={isLoading}
      />
      <textarea
        placeholder="Task Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="form-textarea"
        disabled={isLoading}
        rows="3"
      />
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="form-select"
        disabled={isLoading}
      >
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Creating...' : '➕ Create Task'}
      </button>
    </form>
  );
};

export default TaskForm;