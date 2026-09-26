import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import TaskDetailModal from './TaskDetailModal';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

const KanbanBoard = ({
  project,
  onOpenCreateTask,
  onRefreshProject
}) => {
  const { socket } = useSocket();
  const [columns, setColumns] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Sync columns with project prop
  useEffect(() => {
    if (project && project.columns) {
      setColumns(project.columns);
    }
  }, [project]);

  // Socket.io Real-Time Synchronization Handlers
  useEffect(() => {
    if (!socket || !project) return;

    // Task created by any user
    const handleTaskCreated = (newTask) => {
      setColumns((prevCols) =>
        prevCols.map((col) => {
          if (col.id === newTask.columnId) {
            // Check if already in column to avoid duplicates
            if (col.tasks?.some((t) => t.id === newTask.id)) return col;
            return {
              ...col,
              tasks: [...(col.tasks || []), newTask]
            };
          }
          return col;
        })
      );
    };

    // Task moved across columns or reordered by another user
    const handleTaskMoved = ({ task, sourceColumnId, targetColumnId, newOrder }) => {
      setColumns((prevCols) => {
        // Clone columns
        const newCols = prevCols.map((col) => ({
          ...col,
          tasks: [...(col.tasks || [])]
        }));

        const sourceCol = newCols.find((c) => c.id === sourceColumnId);
        const targetCol = newCols.find((c) => c.id === targetColumnId);

        if (!sourceCol || !targetCol) return prevCols;

        // Remove from source
        const existingTaskIndex = sourceCol.tasks.findIndex((t) => t.id === task.id);
        const [movedTask] = existingTaskIndex !== -1
          ? sourceCol.tasks.splice(existingTaskIndex, 1)
          : [task];

        // Insert into target
        targetCol.tasks.splice(newOrder, 0, { ...movedTask, ...task, columnId: targetColumnId });

        return newCols;
      });

      // Update selectedTask if currently opened in modal
      setSelectedTask((prev) => (prev?.id === task.id ? { ...prev, ...task } : prev));
    };

    // Task updated
    const handleTaskUpdated = (updatedTask) => {
      setColumns((prevCols) =>
        prevCols.map((col) => ({
          ...col,
          tasks: (col.tasks || []).map((t) =>
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
          )
        }))
      );

      setSelectedTask((prev) =>
        prev?.id === updatedTask.id ? { ...prev, ...updatedTask } : prev
      );
    };

    // Task deleted
    const handleTaskDeleted = ({ taskId, columnId }) => {
      setColumns((prevCols) =>
        prevCols.map((col) => {
          if (col.id === columnId || (col.tasks && col.tasks.some((t) => t.id === taskId))) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== taskId)
            };
          }
          return col;
        })
      );

      setSelectedTask((prev) => (prev?.id === taskId ? null : prev));
    };

    // Column events
    const handleColumnCreated = (newCol) => {
      setColumns((prevCols) => {
        if (prevCols.some((c) => c.id === newCol.id)) return prevCols;
        return [...prevCols, { ...newCol, tasks: [] }];
      });
    };

    const handleColumnDeleted = ({ columnId }) => {
      setColumns((prevCols) => prevCols.filter((c) => c.id !== columnId));
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('column:created', handleColumnCreated);
    socket.on('column:deleted', handleColumnDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('column:created', handleColumnCreated);
      socket.off('column:deleted', handleColumnDeleted);
    };
  }, [socket, project]);

  // Handle Drag End with Optimistic UI updates
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColId = source.droppableId;
    const targetColId = destination.droppableId;

    // Optimistic local state update
    const previousColumns = [...columns];
    const newColumns = columns.map((col) => ({
      ...col,
      tasks: [...(col.tasks || [])]
    }));

    const sourceCol = newColumns.find((c) => c.id === sourceColId);
    const targetCol = newColumns.find((c) => c.id === targetColId);

    if (!sourceCol || !targetCol) return;

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    movedTask.columnId = targetColId;
    targetCol.tasks.splice(destination.index, 0, movedTask);

    setColumns(newColumns);

    // Persist to backend API
    try {
      await api.put(`/tasks/${draggableId}/move`, {
        sourceColumnId: sourceColId,
        targetColumnId: targetColId,
        newOrder: destination.index
      });
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert if network error
      setColumns(previousColumns);
    }
  };

  // Quick Add Task inside column
  const handleQuickAddTask = async (columnId, title) => {
    try {
      const res = await api.post('/tasks', {
        title,
        columnId,
        projectId: project.id,
        priority: 'MEDIUM'
      });
      // Handled via state or socket
      setColumns((prevCols) =>
        prevCols.map((col) => {
          if (col.id === columnId) {
            if (col.tasks?.some((t) => t.id === res.data.id)) return col;
            return { ...col, tasks: [...(col.tasks || []), res.data] };
          }
          return col;
        })
      );
    } catch (error) {
      console.error('Failed to quick add task:', error);
    }
  };

  // Add Column
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];
    const randomColor = colors[columns.length % colors.length];

    try {
      const res = await api.post('/columns', {
        name: newColumnName.trim(),
        projectId: project.id,
        color: randomColor
      });
      setColumns((prev) => [...prev, { ...res.data, tasks: [] }]);
      setNewColumnName('');
      setIsAddingColumn(false);
    } catch (error) {
      console.error('Failed to create column:', error);
    }
  };

  // Delete Column
  const handleDeleteColumn = async (columnId) => {
    if (window.confirm('Delete this column and all its tasks?')) {
      try {
        await api.delete(`/columns/${columnId}`);
        setColumns((prev) => prev.filter((c) => c.id !== columnId));
      } catch (error) {
        console.error('Failed to delete column:', error);
      }
    }
  };

  // Update Task handler
  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setColumns((prevCols) =>
        prevCols.map((col) => ({
          ...col,
          tasks: (col.tasks || []).map((t) => (t.id === taskId ? res.data : t))
        }))
      );
      setSelectedTask(res.data);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setColumns((prevCols) =>
        prevCols.map((col) => ({
          ...col,
          tasks: (col.tasks || []).filter((t) => t.id !== taskId)
        }))
      );
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Filter tasks by query and priority
  const getFilteredTasks = (tasks = []) => {
    return tasks.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tags && t.tags.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'ALL' || t.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Board Subheader Toolbar */}
      <div className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{project.name}</span>
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
            Kanban Board
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="w-44 focus:w-56 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Add Task Button */}
          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Area */}
      <div className="flex-1 p-6 overflow-x-auto kanban-column-scroll">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex items-start gap-5 min-w-max h-full pb-6">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={getFilteredTasks(column.tasks)}
                onTaskClick={(task) => setSelectedTask(task)}
                onQuickAddTask={handleQuickAddTask}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {/* Add New Column Box */}
            <div className="w-72 flex-shrink-0">
              {isAddingColumn ? (
                <form
                  onSubmit={handleAddColumn}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xl"
                >
                  <input
                    autoFocus
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column title (e.g. QA, Staging)..."
                    className="w-full text-xs bg-slate-800 border border-indigo-500/50 rounded-xl p-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Create Column
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnName('');
                      }}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full py-3 px-4 bg-slate-900/40 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-400 flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          columns={columns}
          projectMembers={project.members || []}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
