const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM projects ORDER BY is_featured DESC, created_at DESC';
    let params = [];
    if (category && category !== 'All') {
      query = 'SELECT * FROM projects WHERE category = ? ORDER BY is_featured DESC, created_at DESC';
      params = [category];
    }
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/projects
const createProject = async (req, res, next) => {
  try {
    const { title, description, tech_stack, project_url, github_url, category, is_featured } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title) return res.status(400).json({ success: false, message: 'Judul project wajib diisi.' });

    const [result] = await db.query(
      'INSERT INTO projects (title, description, tech_stack, image_url, project_url, github_url, category, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, tech_stack, image_url, project_url, github_url, category || 'Web', is_featured || 0]
    );

    const [newProject] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Project berhasil ditambahkan.', data: newProject[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { title, description, tech_stack, project_url, github_url, category, is_featured } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });

    let image_url = existing[0].image_url;
    if (req.file) {
      // Hapus gambar lama
      if (image_url) {
        const oldPath = path.join(process.cwd(), image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    await db.query(
      'UPDATE projects SET title=?, description=?, tech_stack=?, image_url=?, project_url=?, github_url=?, category=?, is_featured=? WHERE id=?',
      [title, description, tech_stack, image_url, project_url, github_url, category, is_featured, id]
    );

    const [updated] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project berhasil diperbarui.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });

    if (rows[0].image_url) {
      const imgPath = path.join(process.cwd(), rows[0].image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Project berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/categories
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM project_categories ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/projects/categories
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });

    // Check if duplicate
    const [existing] = await db.query('SELECT * FROM project_categories WHERE name = ?', [name.trim()]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Kategori sudah ada.' });

    const [result] = await db.query('INSERT INTO project_categories (name) VALUES (?)', [name.trim()]);
    const [newCat] = await db.query('SELECT * FROM project_categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: newCat[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/projects/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db.query('SELECT * FROM project_categories WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });

    await db.query('DELETE FROM project_categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  getCategories,
  createCategory,
  deleteCategory
};
