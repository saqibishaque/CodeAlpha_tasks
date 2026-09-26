const prisma = require('../prisma');

const createColumn = async (req, res) => {
  try {
    const { projectId, name, color } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: 'Project ID and column name are required' });
    }

    const count = await prisma.column.count({ where: { projectId } });

    const column = await prisma.column.create({
      data: {
        name,
        color: color || '#6366f1',
        order: count,
        projectId
      },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
            _count: { select: { comments: true } }
          }
        }
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('column:created', column);
    }

    res.status(201).json(column);
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
};

const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, order } = req.body;

    const column = await prisma.column.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(order !== undefined && { order })
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${column.projectId}`).emit('column:updated', column);
    }

    res.json(column);
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Failed to update column' });
  }
};

const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const column = await prisma.column.findUnique({ where: { id } });
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }

    const projectId = column.projectId;
    await prisma.column.delete({ where: { id } });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('column:deleted', { columnId: id, projectId });
    }

    res.json({ message: 'Column deleted successfully', columnId: id });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
};

module.exports = {
  createColumn,
  updateColumn,
  deleteColumn
};
