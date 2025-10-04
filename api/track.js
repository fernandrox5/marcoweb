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
    // Prefer standard proxy headers; fall back to socket remote address.
    const headerIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['cf-connecting-ip'] || '';
    let ip = (Array.isArray(headerIp) ? headerIp.join(',') : String(headerIp || ''))
      .split(',')[0]
      .trim();
    if (!ip) {
      ip = req.socket && (req.socket.remoteAddress || req.connection && req.connection.remoteAddress) || '';
    }
    // Normalize IPv4-mapped IPv6 (e.g. ::ffff:1.2.3.4)
    if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

    // Optional debug: dump headers to logs when DEBUG_TRACK=1 (useful during setup)
    try {
      if (process.env.DEBUG_TRACK === '1') {
        console.debug('track headers sample', {
          ipExtracted: ip,
          xff: req.headers['x-forwarded-for'],
          xRealIp: req.headers['x-real-ip'],
          cfConnectingIp: req.headers['cf-connecting-ip'],
          remoteAddr: req.socket && req.socket.remoteAddress
        });
      }
    } catch (e) {
      // ignore logging errors
    }
    const ua = (req.headers['user-agent'] || '').toString().replace(/\n/g, ' ');

    // Generate a short unique code for this entry
    const code = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`.toUpperCase();

    // Simple device detection from user-agent
    let device = 'Desktop';
    try {
      if (/Mobi|Android|iPhone|iPod/i.test(ua)) device = 'Mobile';
      else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
    } catch (e) {}

    // Lookup geolocation (free service ip-api.com). If it fails, leave fields empty.
    let geo = {};
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,zip,isp,query`);
      if (geoRes.ok) {
        const g = await geoRes.json();
        if (g && g.status === 'success') {
          geo = {
            country: g.country || '',
            region: g.regionName || '',
            city: g.city || '',
            zip: g.zip || '',
            isp: g.isp || ''
          };
        } else {
          // if lookup failed, include message
          geo = { message: g && g.message ? g.message : 'lookup_failed' };
        }
      }
    } catch (e) {
      geo = { message: 'lookup_error' };
    }

    // Detect OS, browser and more details from user-agent (best-effort)
    let os = '';
    let browser = '';
    let model = '';
    try {
      const mAndroid = ua.match(/Android\s+([0-9\.]+)/i);
      const miOS = ua.match(/iPhone OS\s*([0-9_]+)/i) || ua.match(/CPU OS\s*([0-9_]+)/i);
      if (mAndroid) os = `Android ${mAndroid[1]}`;
      else if (miOS) os = `iOS ${miOS[1].replace(/_/g, '.')}`;
      else if (/Windows NT/i.test(ua)) os = 'Windows';
      else if (/Mac OS X/i.test(ua)) os = 'macOS';
      else if (/Linux/i.test(ua)) os = 'Linux';

      if (/Edg\//i.test(ua)) browser = (ua.match(/Edg\/([0-9\.]+)/i)||[])[1] ? `Edge ${(ua.match(/Edg\/([0-9\.]+)/i)||[])[1]}` : 'Edge';
      else if (/OPR\//i.test(ua)) browser = (ua.match(/OPR\/([0-9\.]+)/i)||[])[1] ? `Opera ${(ua.match(/OPR\/([0-9\.]+)/i)||[])[1]}` : 'Opera';
      else if (/Chrome\//i.test(ua)) browser = (ua.match(/Chrome\/([0-9\.]+)/i)||[])[1] ? `Chrome ${(ua.match(/Chrome\/([0-9\.]+)/i)||[])[1]}` : 'Chrome';
      else if (/Safari\//i.test(ua) && /Version\//i.test(ua)) browser = (ua.match(/Version\/([0-9\.]+)/i)||[])[1] ? `Safari ${(ua.match(/Version\/([0-9\.]+)/i)||[])[1]}` : 'Safari';
      else if (/Firefox\//i.test(ua)) browser = (ua.match(/Firefox\/([0-9\.]+)/i)||[])[1] ? `Firefox ${(ua.match(/Firefox\/([0-9\.]+)/i)||[])[1]}` : 'Firefox';

      // model detection hints
      if (/iPhone/i.test(ua)) model = 'iPhone';
      else if (/iPad/i.test(ua)) model = 'iPad';
      else {
        const m = ua.match(/Android.+;\s*([^;\)]+)/i);
        if (m && m[1]) model = m[1].trim();
      }
    } catch (e) {}

    // Build a readable, ordered entry block
    const entry = [];
    entry.push(`CODIGO_IP: ${code}`);
    entry.push(`IP: ${ip}`);
    // Date/time in Chile timezone
    try {
      const fechaCL = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago', hour12: false });
      entry.push(`FECHA: ${fechaCL}`);
    } catch (e) {
      entry.push(`FECHA: ${new Date().toISOString()}`);
    }
    entry.push(`DISPOSITIVO: ${device}`);
    if (model) entry.push(`MODELO: ${model}`);
    if (os) entry.push(`SISTEMA: ${os}`);
    if (browser) entry.push(`NAVEGADOR: ${browser}`);
    entry.push(`USER_AGENT: ${ua}`);
    if (geo.country || geo.region || geo.city) {
      entry.push(`PAIS: ${geo.country || ''}`);
      entry.push(`REGION: ${geo.region || ''}`);
      entry.push(`CIUDAD: ${geo.city || ''}`);
      entry.push(`ZIP: ${geo.zip || ''}`);
      entry.push(`ISP: ${geo.isp || ''}`);
    } else if (geo.message) {
      entry.push(`GEO_ERROR: ${geo.message}`);
    }
    entry.push('---');
  const entryText = entry.join('\n') + '\n';

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
          body: JSON.stringify({ files: { 'ips.txt': { content: entryText } }, public: false, description: 'IPs log (created by site)' })
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
            body: JSON.stringify({ files: { 'ips.txt': { content: entryText } }, public: false, description: 'IPs log (created by site)' })
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

  const updated = current + entryText;

    // Update gist with appended content
    const updateRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
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
