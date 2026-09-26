import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  Flag,
  Tag
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

const priorityConfig = {
  URGENT: {
    label: 'Urgent',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30'
  },
  HIGH: {
    label: 'High',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30'
  },
  LOW: {
    label: 'Low',
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30'
  }
};

const TaskCard = ({ task, index, onClick }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) : false;

  const tags = task.tags ? task.tags.split(',').map((t) => t.trim()) : [];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`group bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-3.5 mb-3 transition shadow-sm cursor-pointer select-none ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 rotate-1 scale-102 bg-slate-800 z-50'
              : 'border-slate-700/60 hover:border-slate-600'
          }`}
        >
          {/* Priority & Tags */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}
            >
              <Flag className="w-2.5 h-2.5" />
              {priority.label}
            </span>

            {tags.length > 0 && (
              <div className="flex items-center gap-1 overflow-hidden">
                {tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 max-w-[80px] truncate"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Task Title */}
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 mb-2.5">
            {task.title}
          </h4>

          {/* Optional Short Description Snippet */}
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Card Footer: Due Date, Comments, Assignee */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
            <div className="flex items-center gap-2.5 text-slate-400">
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    isOverdue ? 'text-rose-400' : 'text-slate-400'
                  }`}
                  title={isOverdue ? 'Overdue' : 'Due date'}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                </div>
              )}

              {(task._count?.comments > 0 || task.comments?.length > 0) && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task._count?.comments || task.comments?.length || 0}</span>
                </div>
              )}
            </div>

            {/* Assignee Avatar */}
            <div>
              {task.assignee ? (
                <img
                  src={
                    task.assignee.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.name}`
                  }
                  alt={task.assignee.name}
                  title={`Assigned to ${task.assignee.name}`}
                  className="w-6 h-6 rounded-full ring-1 ring-slate-700 object-cover"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-bold"
                  title="Unassigned"
                >
                  ?
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
