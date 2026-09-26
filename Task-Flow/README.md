# TaskFlow - Full-Stack Collaborative Project Management Tool

TaskFlow is a production-ready, full-stack collaborative Project Management Tool (similar to Trello and Asana) built with **React**, **Node.js/Express**, **Prisma ORM**, and **Socket.io**.

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access Control
- JWT-based authentication with bcrypt password hashing.
- Role management per project: `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`.
- 1-Click Demo Login buttons for instant multi-user testing without signup friction.

### 2. Kanban Board & Workspace Management
- Multiple workspace projects support.
- Customizable Kanban columns (Add, Rename, Delete, Reorder).
- Fluid drag-and-drop task movements powered by `@hello-pangea/dnd`.
- Real-time instant board updates: moving a card in one browser updates other teammates' views instantly via WebSockets without page reload.

### 3. Rich Task Cards & Assignments
- Card details include: Title, Multi-line description, Priority indicator (`Low`, `Medium`, `High`, `Urgent`), Assignee, Due date with overdue badge, and Tags.
- Quick inline card creator and comprehensive Task Detail modal.

### 4. Real-Time Team Discussions & Comments
- Live commenting thread inside every task card.
- User avatars, relative timestamps, and deletion rights.
- Real-time typing indicators (`"Sarah is typing a comment..."`).

### 5. Multi-User Presence
- Live online teammates indicator showing active avatars on the current board.
- Instant WebSocket event synchronization.

---

## 📁 Project Structure

```
taskflow-pm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Relational models (User, Project, ProjectMember, Column, Task, Comment)
│   │   ├── seed.js             # Automated seed script with realistic demo data
│   │   └── dev.db              # SQLite database (zero-configuration out of the box)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, Register, Demo Login, User retrieval
│   │   │   ├── projectController.js  # Project CRUD and team member invitations
│   │   │   ├── columnController.js   # Kanban column management & broadcasts
│   │   │   ├── taskController.js     # Task CRUD, drag-and-drop move endpoint
│   │   │   └── commentController.js  # Live task commenting
│   │   ├── middlewares/
│   │   │   └── auth.js               # JWT verification & user resolution
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── columnRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── commentRoutes.js
│   │   ├── sockets/
│   │   │   └── socketHandler.js      # Socket.io room joins and presence tracking
│   │   ├── prisma.js                 # PrismaClient singleton instance
│   │   └── server.js                 # Express + Socket.io server bootstrap
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx         # Login screen + 1-click persona buttons
│   │   │   │   └── Register.jsx      # Sign-up screen
│   │   │   ├── Board/
│   │   │   │   ├── KanbanBoard.jsx   # DragDropContext & real-time socket events
│   │   │   │   ├── Column.jsx        # Droppable column container
│   │   │   │   ├── TaskCard.jsx      # Draggable card with badges & avatars
│   │   │   │   ├── TaskDetailModal.jsx# Full task editor modal
│   │   │   │   └── CommentThread.jsx # Live discussion & typing indicators
│   │   │   ├── Modals/
│   │   │   │   ├── CreateProjectModal.jsx
│   │   │   │   ├── CreateTaskModal.jsx
│   │   │   │   └── InviteMemberModal.jsx
│   │   │   ├── Navbar.jsx            # Top bar, live presence, project switcher
│   │   │   └── Sidebar.jsx           # Projects list, members, board metrics
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state & JWT handling
│   │   │   └── SocketContext.jsx     # WebSocket rooms & presence management
│   │   ├── services/
│   │   │   ├── api.js                # Axios client with JWT interceptor
│   │   │   └── socket.js             # Socket.io client singleton
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend Server
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev # or: node src/server.js
```
The backend will run on **http://localhost:5000**.

### 2. Start the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 👥 Demo Personas (1-Click Login)

The login screen features 1-click login buttons for testing:
1. **Alex Morgan** (Project Lead / Admin) - `alex@taskflow.dev`
2. **Sarah Chen** (Senior Full-Stack Dev) - `sarah@taskflow.dev`
3. **Marcus Vance** (UI/UX Designer) - `marcus@taskflow.dev`

*Default password for all demo accounts: `password123`*

### Testing Real-Time Collaboration:
1. Open **Tab 1** in your browser and click **Log In as Alex Morgan**.
2. Open **Tab 2** (or Incognito window) and click **Log In as Sarah Chen**.
3. Drag any task card to another column in Tab 1 -> Watch Tab 2 update in real time without refreshing!
4. Post a comment on a task in Tab 2 -> Watch the comment appear instantly in Tab 1.
