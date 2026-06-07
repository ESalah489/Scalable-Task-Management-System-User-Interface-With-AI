import { useEffect } from 'react';
import socket from '../services/socket';
import toast from 'react-hot-toast';

const useWebSocket = (onTaskUpdate, onTaskDelete) => {
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') {
      console.error('Socket is not initialized properly');
      return;
    }

    const handleTaskUpdate = (data) => {
      console.log('📡 Real-time update received:', data);
      
      if (data.type === 'status_changed') {
        toast.success(`Task status changed: ${data.oldStatus} → ${data.task.status}`);
      } else {
        toast.info('Task was updated');
      }
      
      if (onTaskUpdate && typeof onTaskUpdate === 'function') {
        onTaskUpdate(data.task);
      }
    };

    const handleTaskDelete = (data) => {
      console.log('🗑️ Task deleted:', data);
      toast.error('Task was deleted');
      
      if (onTaskDelete && typeof onTaskDelete === 'function') {
        onTaskDelete(data.taskId);
      }
    };

    socket.on('task-update', handleTaskUpdate);
    socket.on('task-deleted', handleTaskDelete);

    return () => {
      socket.off('task-update', handleTaskUpdate);
      socket.off('task-deleted', handleTaskDelete);
    };
  }, [onTaskUpdate, onTaskDelete]);
};

export default useWebSocket;