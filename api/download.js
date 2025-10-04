// Serverless function to download the ips.txt content from the configured Gist
// Protect with DOWNLOAD_TOKEN env var. Set DOWNLOAD_TOKEN in Vercel dashboard and use it as a query token.

export default async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const gistId = process.env.GIST_ID;
    const downloadToken = process.env.DOWNLOAD_TOKEN;

    const q = (req.query && req.query.token) ? req.query.token : null;
    if (!downloadToken || q !== downloadToken) {
      return res.status(403).send('forbidden');
    }

    if (!token || !gistId) {
      return res.status(500).json({ error: 'GITHUB_TOKEN and GIST_ID must be configured in environment' });
    }

    const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });
    if (!gistRes.ok) return res.status(500).json({ error: 'failed to fetch gist' });
    const gist = await gistRes.json();
    const fileName = Object.keys(gist.files).includes('ips.txt') ? 'ips.txt' : Object.keys(gist.files)[0];
    const content = gist.files[fileName] && gist.files[fileName].content ? gist.files[fileName].content : '';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(content);
  } catch (err) {
    console.error('download error', err);
    res.status(500).json({ error: 'internal' });
  }
}
