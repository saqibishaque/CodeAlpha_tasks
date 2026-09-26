// Socket.io event handler for real-time collaboration
const socketHandler = (io) => {
  // Map of active users per project: { [projectId]: Set of user objects }
  const activeProjectUsers = new Map();

  io.on('connection', (socket) => {
    let currentProject = null;
    let currentUser = null;

    // Join a project workspace room
    socket.on('join:project', ({ projectId, user }) => {
      if (!projectId) return;

      currentProject = projectId;
      currentUser = user;
      socket.join(`project:${projectId}`);

      // Track active users
      if (!activeProjectUsers.has(projectId)) {
        activeProjectUsers.set(projectId, new Map());
      }
      if (user && user.id) {
        activeProjectUsers.get(projectId).set(user.id, {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          socketId: socket.id
        });
      }

      // Broadcast active user list
      const userList = Array.from(activeProjectUsers.get(projectId).values());
      io.to(`project:${projectId}`).emit('users:active', userList);
    });

    // Leave a project workspace room
    socket.on('leave:project', ({ projectId, userId }) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        if (activeProjectUsers.has(projectId) && userId) {
          activeProjectUsers.get(projectId).delete(userId);
          const userList = Array.from(activeProjectUsers.get(projectId).values());
          io.to(`project:${projectId}`).emit('users:active', userList);
        }
      }
    });

    // Client-initiated typing or activity notification
    socket.on('task:typing', ({ projectId, taskId, userName }) => {
      socket.to(`project:${projectId}`).emit('task:typing', { taskId, userName });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentProject && currentUser && currentUser.id) {
        if (activeProjectUsers.has(currentProject)) {
          activeProjectUsers.get(currentProject).delete(currentUser.id);
          const userList = Array.from(activeProjectUsers.get(currentProject).values());
          io.to(`project:${currentProject}`).emit('users:active', userList);
        }
      }
    });
  });
};

module.exports = socketHandler;
