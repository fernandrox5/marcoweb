// Serverless function for Vercel: append visitor info to a GitHub Gist file (ips.txt)
// Required environment variables (set these in Vercel dashboard):
// - GITHUB_TOKEN : a GitHub personal access token with 'gist' scope
// - GIST_ID      : the ID of an existing gist that contains a file named 'ips.txt'

export default async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN;
    let gistId = process.env.GIST_ID; // may be undefined; we'll create a gist if missing

    if (!token) {
      console.error('Missing GITHUB_TOKEN in environment');
      return res.status(500).json({ error: 'GITHUB_TOKEN must be configured in environment' });
    }

    // Determine visitor IP (best-effort behind proxies)
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
    const ua = (req.headers['user-agent'] || '').toString().replace(/\n/g, ' ');
    const line = `${new Date().toISOString()} - ${ip} - ${ua}\n`;

    // If no gistId configured, create a new gist with the first line and return its id
    if (!gistId) {
      try {
        const createRes = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ files: { 'ips.txt': { content: line } }, public: false, description: 'IPs log (created by site)' })
        });
        if (!createRes.ok) {
          const cb = await createRes.text();
          console.error('Failed to create gist', createRes.status, cb.slice(0, 1000));
          return res.status(500).json({ error: 'Failed to create gist', status: createRes.status, body: cb });
        }
        const created = await createRes.json();
        console.log('Created gist automatically', { id: created.id });
        // Return created gist id so the user can save it into GIST_ID env var
        return res.status(200).json({ success: true, gistCreated: true, gistId: created.id });
      } catch (createErr) {
        console.error('Error creating gist', createErr);
        return res.status(500).json({ error: 'Failed to create gist' });
      }
    }

    // Fetch existing gist
    const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!gistRes.ok) {
      const body = await gistRes.text();
      console.error('Failed to fetch gist', { status: gistRes.status, body: body.slice(0, 1000) });

      // If gist not found (404) try to create it automatically
      if (gistRes.status === 404) {
        try {
          const createRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ files: { 'ips.txt': { content: line } }, public: false, description: 'IPs log (created by site)' })
          });
          if (!createRes.ok) {
            const cb = await createRes.text();
            console.error('Failed to create gist', createRes.status, cb.slice(0, 1000));
            return res.status(500).json({ error: 'Failed to fetch gist and failed to create new gist', status: gistRes.status, body });
          }
          const created = await createRes.json();
          console.log('Created gist automatically', { id: created.id });
          return res.status(200).json({ success: true, gistCreated: true, gistId: created.id });
        } catch (createErr) {
          console.error('Error creating gist', createErr);
          return res.status(500).json({ error: 'Failed to create gist' });
        }
      }

      return res.status(500).json({ error: 'Failed to fetch gist', status: gistRes.status, body });
    }

    const gist = await gistRes.json();
    // Ensure the file exists or pick the first file
    const fileName = Object.keys(gist.files).includes('ips.txt') ? 'ips.txt' : Object.keys(gist.files)[0];
    const current = (gist.files[fileName] && gist.files[fileName].content) ? gist.files[fileName].content : '';

    const updated = current + line;

    // Update gist with appended content
    const updateRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files: { [fileName]: { content: updated } } })
    });

    if (!updateRes.ok) {
      const body = await updateRes.text();
      return res.status(500).json({ error: 'Failed to update gist', status: updateRes.status, body });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('track error', err);
    return res.status(500).json({ error: 'internal' });
  }
}
