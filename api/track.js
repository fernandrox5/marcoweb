// Serverless function for Vercel: append visitor info to a GitHub Gist file (ips.txt)
// Required environment variables (set these in Vercel dashboard):
// - GITHUB_TOKEN : a GitHub personal access token with 'gist' scope
// - GIST_ID      : the ID of an existing gist that contains a file named 'ips.txt'

export default async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const gistId = process.env.GIST_ID;

    if (!token || !gistId) {
      return res.status(500).json({ error: 'GITHUB_TOKEN and GIST_ID must be configured in environment' });
    }

    // Determine visitor IP (best-effort behind proxies)
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
    const ua = (req.headers['user-agent'] || '').toString().replace(/\n/g, ' ');
    const line = `${new Date().toISOString()} - ${ip} - ${ua}\n`;

    // Fetch existing gist
    const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!gistRes.ok) {
      const body = await gistRes.text();
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
