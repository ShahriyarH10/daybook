import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    due: row.due ? row.due.toISOString().slice(0, 10) : '',
    notes: row.notes || '',
    done: row.done,
    created: Number(row.created_at)
  };
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Task id is required' });
  }

  try {
    if (req.method === 'PATCH') {
      const body = req.body || {};

      // Fetch current row first so we can apply partial updates
      const existingRows = await sql`SELECT * FROM tasks WHERE id = ${id}`;
      if (existingRows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      const current = existingRows[0];

      const title    = body.title    !== undefined ? body.title.trim() : current.title;
      const category = body.category !== undefined ? body.category    : current.category;
      const priority = body.priority !== undefined ? body.priority    : current.priority;
      const due      = body.due      !== undefined ? (body.due || null) : current.due;
      const notes    = body.notes    !== undefined ? body.notes        : current.notes;
      const done     = body.done     !== undefined ? body.done         : current.done;

      const rows = await sql`
        UPDATE tasks
        SET title = ${title},
            category = ${category},
            priority = ${priority},
            due = ${due},
            notes = ${notes},
            done = ${done}
        WHERE id = ${id}
        RETURNING *
      `;
      return res.status(200).json(rowToTask(rows[0]));
    }

    if (req.method === 'DELETE') {
      const rows = await sql`DELETE FROM tasks WHERE id = ${id} RETURNING id`;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
