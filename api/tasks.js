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
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
      return res.status(200).json(rows.map(rowToTask));
    }

    if (req.method === 'POST') {
      const { id, title, category, priority, due, notes, done, created } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const rows = await sql`
        INSERT INTO tasks (id, title, category, priority, due, notes, done, created_at)
        VALUES (
          ${id},
          ${title.trim()},
          ${category || 'other'},
          ${priority || 'medium'},
          ${due || null},
          ${notes || ''},
          ${done || false},
          ${created || Date.now()}
        )
        RETURNING *
      `;
      return res.status(201).json(rowToTask(rows[0]));
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
