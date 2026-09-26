import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  CheckSquare, 
  LogOut, 
  Radio, 
  Users, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ activeProject, projects, onSelectProject, onOpenCreateProject }) => {
  const { user, logout } = useAuth();
  const { activeUsers } = useSocket();

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">TaskFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Project Switcher Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-slate-200 max-w-[180px] truncate">
              {activeProject ? activeProject.name : 'Select Project'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition" />
          </div>

          <div className="absolute left-0 mt-2 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-2 hidden group-hover:block z-50">
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </div>
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-800 transition ${
                  activeProject?.id === proj.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                }`}
              >
                <span className="truncate">{proj.name}</span>
                {activeProject?.id === proj.id && (
                  <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5">Active</span>
                )}
              </button>
            ))}
            <div className="border-t border-slate-800 mt-1 pt-1 px-2">
              <button
                onClick={onOpenCreateProject}
                className="w-full text-left px-2 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded font-medium flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                + Create New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Realtime Indicator */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="w-3.5 h-3.5" />
          <span>Real-time Live Sync</span>
        </div>

        {/* Live Active Collaborators */}
        {activeUsers.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex -space-x-1.5 overflow-hidden">
              {activeUsers.slice(0, 4).map((u) => (
                <img
                  key={u.id}
                  src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                  alt={u.name}
                  title={`${u.name} is currently active on this board`}
                  className="w-5 h-5 rounded-full ring-2 ring-slate-900 object-cover"
                />
              ))}
            </div>
            <span className="text-slate-300 font-medium ml-1">
              {activeUsers.length} online
            </span>
          </div>
        )}
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200 leading-tight">
                {user.name}
              </div>
              <div className="text-xs text-indigo-400 font-medium">
                {user.role || 'Member'}
              </div>
            </div>
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 object-cover"
            />
          </div>
        )}

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
