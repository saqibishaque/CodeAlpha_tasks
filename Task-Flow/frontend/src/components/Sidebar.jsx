import React from 'react';
import { 
  FolderKanban, 
  Plus, 
  Users, 
  UserPlus, 
  Layers, 
  Calendar, 
  Hash, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const Sidebar = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenCreateProject,
  onOpenInviteMember
}) => {
  const totalTasks = activeProject?.columns?.reduce((acc, col) => acc + (col.tasks?.length || 0), 0) || 0;
  const totalColumns = activeProject?.columns?.length || 0;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] flex-shrink-0">
      <div className="p-4 space-y-6 overflow-y-auto kanban-column-scroll">
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              Projects
            </span>
            <button
              onClick={onOpenCreateProject}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Create New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((proj) => {
              const isActive = activeProject?.id === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-white' : 'bg-indigo-400'
                      }`}
                    />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  {proj._count?.tasks !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {proj._count.tasks}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Team Members */}
        {activeProject && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Team ({activeProject.members?.length || 1})
              </span>
              <button
                onClick={onOpenInviteMember}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title="Invite Teammate"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {activeProject.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={member.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.name}`}
                      alt={member.user?.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <span className="text-slate-200 font-medium truncate">
                      {member.user?.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                      member.role === 'OWNER'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : member.role === 'ADMIN'
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Stats */}
        {activeProject && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Board Overview
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Columns</span>
                </div>
                <div className="text-lg font-bold text-slate-100">{totalColumns}</div>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Tasks</span>
                </div>
                <div className="text-lg font-bold text-slate-100">{totalTasks}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Socket.io v4 Active</span>
        </div>
        <span className="font-mono text-[10px]">v2.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
