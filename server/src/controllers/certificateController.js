const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const getCertificates = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM certificates ORDER BY issue_date DESC');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createCertificate = async (req, res, next) => {
  try {
    const { title, issuer, issue_date, credential_url } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !issuer) return res.status(400).json({ success: false, message: 'Judul dan issuer wajib diisi.' });

    const [result] = await db.query(
      'INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, issuer, issue_date, credential_url, image_url]
    );
    const [newCert] = await db.query('SELECT * FROM certificates WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Sertifikat berhasil ditambahkan.', data: newCert[0] });
  } catch (err) { next(err); }
};

const updateCertificate = async (req, res, next) => {
  try {
    const { title, issuer, issue_date, credential_url } = req.body;
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Sertifikat tidak ditemukan.' });

    let image_url = existing[0].image_url;
    if (req.file) {
      if (image_url) {
        const oldPath = path.join(process.cwd(), image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    await db.query(
      'UPDATE certificates SET title=?, issuer=?, issue_date=?, credential_url=?, image_url=? WHERE id=?',
      [title, issuer, issue_date, credential_url, image_url, id]
    );
    const [updated] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Sertifikat berhasil diperbarui.', data: updated[0] });
  } catch (err) { next(err); }
};

const deleteCertificate = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM certificates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Sertifikat tidak ditemukan.' });
    if (rows[0].image_url) {
      const imgPath = path.join(process.cwd(), rows[0].image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await db.query('DELETE FROM certificates WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Sertifikat berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = { getCertificates, createCertificate, updateCertificate, deleteCertificate };
