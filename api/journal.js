import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function rowToEntry(row) {
  return {
    id: row.id,
    date: row.date,           // 'YYYY-MM-DD'
    content: row.content,
    created: Number(row.created_at),
    updated: Number(row.updated_at)
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM journal_entries ORDER BY date DESC`;
      return res.status(200).json(rows.map(rowToEntry));
    }

    if (req.method === 'POST') {
      const { id, date, content } = req.body;
      if (!date) return res.status(400).json({ error: 'date is required' });
      const now = Date.now();
      const rows = await sql`
        INSERT INTO journal_entries (id, date, content, created_at, updated_at)
        VALUES (${id}, ${date}, ${content || ''}, ${now}, ${now})
        ON CONFLICT (id) DO UPDATE
          SET content = EXCLUDED.content, updated_at = EXCLUDED.updated_at
        RETURNING *
      `;
      return res.status(201).json(rowToEntry(rows[0]));
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
