import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function rowToEntry(row) {
  return {
    id: row.id,
    date: row.date,
    content: row.content,
    created: Number(row.created_at),
    updated: Number(row.updated_at)
  };
}

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    if (req.method === 'PATCH') {
      const { content } = req.body;
      const rows = await sql`
        UPDATE journal_entries
        SET content = ${content || ''}, updated_at = ${Date.now()}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(rowToEntry(rows[0]));
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM journal_entries WHERE id = ${id}`;
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
