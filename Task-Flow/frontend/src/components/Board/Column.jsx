import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus, MoreHorizontal, Trash2, X } from 'lucide-react';

const Column = ({
  column,
  tasks,
  onTaskClick,
  onQuickAddTask,
  onDeleteColumn
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      onQuickAddTask(column.id, quickTitle.trim());
      setQuickTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-8.5rem)] shadow-lg shadow-black/20">
      {/* Column Header */}
      <div className="p-3.5 pb-2 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color || '#6366f1' }}
          />
          <h3 className="font-semibold text-slate-100 text-sm tracking-tight">
            {column.name}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
            {tasks.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 z-40">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteColumn(column.id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks List Droppable Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 overflow-y-auto kanban-column-scroll transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20' : ''
            }`}
            style={{ minHeight: '120px' }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !isAdding && (
              <div className="h-28 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 select-none">
                Drop cards here
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Quick Add Task Footer */}
      <div className="p-3 pt-1 border-t border-slate-800/60">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              className="w-full text-xs bg-slate-800 border border-indigo-500/60 rounded-lg p-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setQuickTitle('');
                }}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;
