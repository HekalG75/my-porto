const db = require('../config/db');

const getServices = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM services WHERE is_active = 1 ORDER BY order_index ASC');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getAllServices = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY order_index ASC');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createService = async (req, res, next) => {
  try {
    const { title, description, icon_name, order_index, is_active } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Judul layanan wajib diisi.' });
    const [result] = await db.query(
      'INSERT INTO services (title, description, icon_name, order_index, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, description, icon_name || 'Code', order_index || 0, is_active !== undefined ? is_active : 1]
    );
    const [newService] = await db.query('SELECT * FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Layanan berhasil ditambahkan.', data: newService[0] });
  } catch (err) { next(err); }
};

const updateService = async (req, res, next) => {
  try {
    const { title, description, icon_name, order_index, is_active } = req.body;
    const [existing] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    await db.query(
      'UPDATE services SET title=?, description=?, icon_name=?, order_index=?, is_active=? WHERE id=?',
      [title, description, icon_name, order_index, is_active, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Layanan berhasil diperbarui.', data: updated[0] });
  } catch (err) { next(err); }
};

const deleteService = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id FROM services WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Layanan berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = { getServices, getAllServices, createService, updateService, deleteService };
