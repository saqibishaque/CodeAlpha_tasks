const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'alex@taskflow.dev',
      password: defaultPassword,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@taskflow.dev',
      password: defaultPassword,
      role: 'MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  });

  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@taskflow.dev',
      password: defaultPassword,
      role: 'MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log(' Created demo users: Alex, Sarah, Marcus');

  // 2. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'TaskFlow Platform V2',
      description: 'Next-generation collaborative project management suite with live Kanban boards and instant WebSockets synchronisation.',
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: 'OWNER' },
          { userId: sarah.id, role: 'ADMIN' },
          { userId: marcus.id, role: 'MEMBER' }
        ]
      }
    }
  });

  console.log(` Created project: ${project.name}`);

  // 3. Create Columns
  const backlogCol = await prisma.column.create({
    data: { name: 'Backlog', order: 0, color: '#94a3b8', projectId: project.id }
  });
  const todoCol = await prisma.column.create({
    data: { name: 'To Do', order: 1, color: '#3b82f6', projectId: project.id }
  });
  const inProgressCol = await prisma.column.create({
    data: { name: 'In Progress', order: 2, color: '#f59e0b', projectId: project.id }
  });
  const reviewCol = await prisma.column.create({
    data: { name: 'Review', order: 3, color: '#8b5cf6', projectId: project.id }
  });
  const doneCol = await prisma.column.create({
    data: { name: 'Done', order: 4, color: '#10b981', projectId: project.id }
  });

  console.log(' Created 5 Kanban columns');

  // Helper date function
  const daysFromNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  // 4. Create Tasks
  // In Progress Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Real-Time WebSocket Sync for Kanban Cards',
      description: 'Implement Socket.io bidirectional event broadcasting so that moving cards or modifying details updates instantly on all connected teammates screens without page reload.',
      priority: 'URGENT',
      dueDate: daysFromNow(2),
      order: 0,
      tags: 'Realtime,WebSockets',
      columnId: inProgressCol.id,
      projectId: project.id,
      creatorId: alex.id,
      assigneeId: alex.id
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design Responsive Kanban Board with Smooth Drag & Drop',
      description: 'Leverage @hello-pangea/dnd with custom draggable items, subtle drop shadows, and responsive layout for mobile and desktop screens.',
      priority: 'HIGH',
      dueDate: daysFromNow(3),
      order: 1,
      tags: 'Frontend,UI/UX',
      columnId: inProgressCol.id,
      projectId: project.id,
      creatorId: alex.id,
      assigneeId: marcus.id
    }
  });

  // To Do Tasks
  const task3 = await prisma.task.create({
    data: {
      title: 'Implement Task Detail Modal & Live Commenting',
      description: 'Build a comprehensive modal allowing title editing, priority level toggling, assignee reassignment, due date picker, and full comment thread history.',
      priority: 'HIGH',
      dueDate: daysFromNow(4),
      order: 0,
      tags: 'Feature,Comments',
      columnId: todoCol.id,
      projectId: project.id,
      creatorId: sarah.id,
      assigneeId: sarah.id
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Project Member Role Management & Access Control',
      description: 'Enforce OWNER, ADMIN, and MEMBER roles across backend REST endpoints and frontend permission guards.',
      priority: 'MEDIUM',
      dueDate: daysFromNow(6),
      order: 1,
      tags: 'Backend,Auth',
      columnId: todoCol.id,
      projectId: project.id,
      creatorId: alex.id,
      assigneeId: sarah.id
    }
  });

  // Review Tasks
  const task5 = await prisma.task.create({
    data: {
      title: 'Database Schema & Prisma ORM Relational Migration',
      description: 'Configure Prisma schema with User, Project, ProjectMember, Column, Task, and Comment models with relational cascades and indexes.',
      priority: 'HIGH',
      dueDate: daysFromNow(-1),
      order: 0,
      tags: 'Database,Prisma',
      columnId: reviewCol.id,
      projectId: project.id,
      creatorId: sarah.id,
      assigneeId: sarah.id
    }
  });

  // Done Tasks
  const task6 = await prisma.task.create({
    data: {
      title: 'JWT Authentication and User Profile API Endpoints',
      description: 'Create secure registration, bcrypt password hashing, token issue, and user profile retrieval.',
      priority: 'MEDIUM',
      dueDate: daysFromNow(-3),
      order: 0,
      tags: 'Backend,Security',
      columnId: doneCol.id,
      projectId: project.id,
      creatorId: alex.id,
      assigneeId: alex.id
    }
  });

  // Backlog Tasks
  const task7 = await prisma.task.create({
    data: {
      title: 'Export Board Tasks to CSV / JSON',
      description: 'Allow workspace administrators to export their project boards and task archives into formatted CSV and JSON backups.',
      priority: 'LOW',
      dueDate: daysFromNow(12),
      order: 0,
      tags: 'Export,Data',
      columnId: backlogCol.id,
      projectId: project.id,
      creatorId: marcus.id,
      assigneeId: marcus.id
    }
  });

  console.log(' Created 7 rich task cards across columns');

  // 5. Create Comments
  await prisma.comment.create({
    data: {
      content: 'I have set up the Socket.io room logic using `project:${projectId}` rooms. Working on the task:moved handler now!',
      taskId: task1.id,
      userId: alex.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Awesome! On the frontend side, I am wiring up the socket listener to trigger an optimistic board state update.',
      taskId: task1.id,
      userId: sarah.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Color scheme and card hover shadows look crisp! Added priority indicator pills (Low, Medium, High, Urgent).',
      taskId: task2.id,
      userId: marcus.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Prisma schema and migrations are fully verified with SQLite, and 100% ready for PostgreSQL.',
      taskId: task5.id,
      userId: sarah.id
    }
  });

  console.log(' Created sample comments and discussions');
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
