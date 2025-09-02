import { getPool } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const config = { 
  api: { 
    bodyParser: false,
    responseLimit: false
  } 
};

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Promise wrapper for formidable
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      uploadDir: path.join(process.cwd(), 'public', 'temp'),
      filename: (name, ext, part) => {
        return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const pool = getPool();
      const url = new URL(req.url, `http://${req.headers.host}`);
      const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || '9')));
      const search = (url.searchParams.get('q') || '').trim();
      const city = (url.searchParams.get('city') || '').trim();
      const sort = (url.searchParams.get('sort') || 'relevance').trim();
      const offset = (page - 1) * limit;

      const where = [];
      const params = [];
      if (search) {
        where.push('(name LIKE ? OR city LIKE ? OR address LIKE ?)');
        const like = `%${search}%`;
        params.push(like, like, like);
      }
      if (city) {
        where.push('city = ?');
        params.push(city);
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      // Sort mapping: we don't have fees column, so approximate
      // relevance -> newest first (id DESC)
      // fees-low -> name ASC (stable proxy)
      // fees-high -> name DESC (stable proxy)
      let orderSql = 'ORDER BY id DESC';
      if (sort === 'fees-low') orderSql = 'ORDER BY name ASC, id DESC';
      else if (sort === 'fees-high') orderSql = 'ORDER BY name DESC, id DESC';

      const [rows] = await pool.query(
        `SELECT SQL_CALC_FOUND_ROWS id, name, address, city, state, contact, image, email_id
         FROM schools ${whereSql}
         ${orderSql}
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      const [countRows] = await pool.query('SELECT FOUND_ROWS() as total');
      const total = countRows[0]?.total || 0;

      res.status(200).json({ success: true, data: rows, page, limit, total });
    } catch (err) {
      console.error('GET /api/schools error:', err);
      res.status(500).json({ success: false, message: 'Database error', error: String(err) });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      // Ensure upload directories exist
      const uploadDir = path.join(process.cwd(), 'public', 'schoolImages');
      const tempDir = path.join(process.cwd(), 'public', 'temp');
      ensureDirSync(uploadDir);
      ensureDirSync(tempDir);

      // Parse form data
      const { fields, files } = await parseFormData(req);

      // Validate required fields
      const name = String(fields.name || '').trim();
      const address = String(fields.address || '').trim();
      const city = String(fields.city || '').trim();
      const state = String(fields.state || '').trim();
      const contactStr = String(fields.contact || '').trim();
      const emailId = String(fields.email_id || '').trim();

      if (!name || !address || !city || !state || !contactStr || !emailId) {
        res.status(422).json({ success: false, message: 'All fields are required' });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
        res.status(422).json({ success: false, message: 'Invalid email format' });
        return;
      }

      if (!/^\d{7,15}$/.test(contactStr)) {
        res.status(422).json({ success: false, message: 'Invalid contact number format' });
        return;
      }

      // simplified schema only

      // Handle image file
      const imageFile = files.image;
      if (!imageFile) {
        res.status(422).json({ success: false, message: 'Image is required' });
        return;
      }

      const file = Array.isArray(imageFile) ? imageFile[0] : imageFile;
      
      if (!file.filepath) {
        res.status(422).json({ success: false, message: 'Invalid image file' });
        return;
      }

      // Generate safe filename
      const safeBase = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const safeName = `${safeBase}.jpg`;
      const destPath = path.join(uploadDir, safeName);

      try {
        // Process image with sharp
        await sharp(file.filepath)
          .rotate()
          .resize(1280, 960, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(destPath);

        // Clean up temp file
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Clean up temp file on error
        if (file.filepath && fs.existsSync(file.filepath)) {
          try { fs.unlinkSync(file.filepath); } catch {}
        }
        res.status(500).json({ success: false, message: 'Failed to process image' });
        return;
      }

      const imageRelPath = `/schoolImages/${safeName}`;

      // Convert contact to BigInt
      let contact;
      try {
        contact = BigInt(contactStr);
      } catch (bigIntError) {
        res.status(422).json({ success: false, message: 'Invalid contact number' });
        return;
      }

      // Check for duplicate email
      const pool = getPool();
      const [existing] = await pool.query(
        'SELECT id FROM schools WHERE email_id = ? LIMIT 1', 
        [emailId]
      );
      
      if (existing.length > 0) {
        res.status(409).json({ 
          success: false, 
          message: 'A school with this email already exists' 
        });
        return;
      }

      // Insert new school
      await pool.query(
        'INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, address, city, state, contact.toString(), imageRelPath, emailId]
      );

      res.status(201).json({ 
        success: true, 
        message: 'School added successfully' 
      });

    } catch (error) {
      console.error('POST /api/schools error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save school', 
        error: String(error) 
      });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
