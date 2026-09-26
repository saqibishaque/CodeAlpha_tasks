const prisma = require('../prisma');

const createTask = async (req, res) => {
  try {
    const { title, description, priority = 'MEDIUM', dueDate, columnId, projectId, assigneeId, tags } = req.body;
    const creatorId = req.user.id;

    if (!title || !columnId || !projectId) {
      return res.status(400).json({ error: 'Title, columnId, and projectId are required' });
    }

    // Determine order (last in the column)
    const taskCount = await prisma.task.count({ where: { columnId } });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: taskCount,
        tags: tags || null,
        columnId,
        projectId,
        creatorId,
        assigneeId: assigneeId || null
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { comments: true } }
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task:created', task);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        column: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, assigneeId, tags, columnId } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(tags !== undefined && { tags }),
        ...(columnId !== undefined && { columnId })
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        column: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${updatedTask.projectId}`).emit('task:updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetColumnId, newOrder, sourceColumnId } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.projectId;
    const isSameColumn = task.columnId === targetColumnId;

    if (isSameColumn) {
      // Reordering within the same column
      const columnTasks = await prisma.task.findMany({
        where: { columnId: targetColumnId, NOT: { id } },
        orderBy: { order: 'asc' }
      });

      columnTasks.splice(newOrder, 0, task);

      const updates = columnTasks.map((t, index) =>
        prisma.task.update({
          where: { id: t.id },
          data: { order: index }
        })
      );
      await prisma.$transaction(updates);
    } else {
      // Moving to a different column
      // 1. Shift tasks in source column
      const sourceTasks = await prisma.task.findMany({
        where: { columnId: task.columnId, NOT: { id } },
        orderBy: { order: 'asc' }
      });
      const sourceUpdates = sourceTasks.map((t, index) =>
        prisma.task.update({
          where: { id: t.id },
          data: { order: index }
        })
      );

      // 2. Insert into target column
      const targetTasks = await prisma.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { order: 'asc' }
      });
      targetTasks.splice(newOrder, 0, { ...task, columnId: targetColumnId });

      const targetUpdates = targetTasks.map((t, index) =>
        prisma.task.update({
          where: { id: t.id },
          data: { order: index, columnId: targetColumnId }
        })
      );

      await prisma.$transaction([...sourceUpdates, ...targetUpdates]);
    }

    const updatedTask = await prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        column: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task:moved', {
        task: updatedTask,
        sourceColumnId: task.columnId,
        targetColumnId,
        newOrder
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { projectId, columnId } = task;
    await prisma.task.delete({ where: { id } });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task:deleted', { taskId: id, columnId, projectId });
    }

    res.json({ message: 'Task deleted successfully', taskId: id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  moveTask,
  deleteTask
};
