import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import api from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/Board/KanbanBoard';
import CreateProjectModal from './components/Modals/CreateProjectModal';
import CreateTaskModal from './components/Modals/CreateTaskModal';
import InviteMemberModal from './components/Modals/InviteMemberModal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);

  // Fetch all user's projects
  const fetchProjects = async (selectedId = null) => {
    try {
      setLoadingProjects(true);
      const res = await api.get('/projects');
      setProjects(res.data);

      if (res.data.length > 0) {
        const targetId = selectedId || activeProject?.id || res.data[0].id;
        fetchProjectDetails(targetId);
      } else {
        setActiveProject(null);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch full details of single project (columns, tasks, members)
  const fetchProjectDetails = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setActiveProject(res.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const handleSelectProject = (projectId) => {
    fetchProjectDetails(projectId);
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    fetchProjectDetails(newProject.id);
  };

  const handleMemberAdded = (newMember) => {
    setActiveProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: [...(prev.members || []), newMember]
      };
    });
  };

  const handleTaskCreated = (newTask) => {
    setActiveProject((prev) => {
      if (!prev) return prev;
      const updatedColumns = (prev.columns || []).map((col) => {
        if (col.id === newTask.columnId) {
          return {
            ...col,
            tasks: [...(col.tasks || []), newTask]
          };
        }
        return col;
      });
      return { ...prev, columns: updatedColumns };
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <span className="text-sm font-medium">Loading TaskFlow...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <SocketProvider activeProjectId={activeProject?.id}>
      <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeProject={activeProject}
          projects={projects}
          onSelectProject={handleSelectProject}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        />

        {/* Main Body: Sidebar + Kanban Board */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onOpenCreateProject={() => setIsCreateProjectOpen(true)}
            onOpenInviteMember={() => setIsInviteMemberOpen(true)}
          />

          <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {loadingProjects && !activeProject ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <span className="text-xs">Loading board workspace...</span>
              </div>
            ) : activeProject ? (
              <KanbanBoard
                project={activeProject}
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                onRefreshProject={() => fetchProjectDetails(activeProject.id)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  +
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Projects Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-5">
                  Get started by creating your first collaborative workspace and project board.
                </p>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Modals */}
        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onProjectCreated={handleProjectCreated}
        />

        {activeProject && (
          <>
            <CreateTaskModal
              isOpen={isCreateTaskOpen}
              onClose={() => setIsCreateTaskOpen(false)}
              columns={activeProject.columns || []}
              projectMembers={activeProject.members || []}
              projectId={activeProject.id}
              onTaskCreated={handleTaskCreated}
            />

            <InviteMemberModal
              isOpen={isInviteMemberOpen}
              onClose={() => setIsInviteMemberOpen(false)}
              projectId={activeProject.id}
              currentMembers={activeProject.members || []}
              onMemberAdded={handleMemberAdded}
            />
          </>
        )}
      </div>
    </SocketProvider>
  );
}

import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
