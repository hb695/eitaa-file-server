import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const uploadDir = path.join('/tmp', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    const uploadedFile = files.file ? files.file[0] : null;
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileName = path.basename(uploadedFile.filepath);
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';

    // لینک موقت مستقیم برای دانلود
    const fileUrl = `${protocol}://${host}/api/upload?get=${fileName}`;

    return res.status(200).json({
      success: true,
      url: fileUrl,
      filename: uploadedFile.originalFilename
    });
  });
}
