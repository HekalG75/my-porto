const db = require('../config/db');

const getJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM job_tracker ORDER BY applied_date DESC';
    let params = [];
    if (status && status !== 'All') {
      query = 'SELECT * FROM job_tracker WHERE status = ? ORDER BY applied_date DESC';
      params = [status];
    }
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getJobStats = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'Applied') AS applied,
        SUM(status = 'Interviewing') AS interviewing,
        SUM(status = 'Offered') AS offered,
        SUM(status = 'Rejected') AS rejected
      FROM job_tracker
    `);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const createJob = async (req, res, next) => {
  try {
    const { company_name, job_title, status, applied_date, notes, job_url, salary_range } = req.body;
    if (!company_name || !job_title || !applied_date) {
      return res.status(400).json({ success: false, message: 'Company, job title, dan tanggal wajib diisi.' });
    }
    const [result] = await db.query(
      'INSERT INTO job_tracker (company_name, job_title, status, applied_date, notes, job_url, salary_range) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [company_name, job_title, status || 'Applied', applied_date, notes, job_url, salary_range]
    );
    const [newJob] = await db.query('SELECT * FROM job_tracker WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Lamaran berhasil ditambahkan.', data: newJob[0] });
  } catch (err) { next(err); }
};

const updateJob = async (req, res, next) => {
  try {
    const { company_name, job_title, status, applied_date, notes, job_url, salary_range } = req.body;
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM job_tracker WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Data lamaran tidak ditemukan.' });
    await db.query(
      'UPDATE job_tracker SET company_name=?, job_title=?, status=?, applied_date=?, notes=?, job_url=?, salary_range=? WHERE id=?',
      [company_name, job_title, status, applied_date, notes, job_url, salary_range, id]
    );
    const [updated] = await db.query('SELECT * FROM job_tracker WHERE id = ?', [id]);
    res.json({ success: true, message: 'Lamaran berhasil diperbarui.', data: updated[0] });
  } catch (err) { next(err); }
};

const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Interviewing', 'Offered', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }
    await db.query('UPDATE job_tracker SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await db.query('SELECT * FROM job_tracker WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Status berhasil diperbarui.', data: updated[0] });
  } catch (err) { next(err); }
};

const deleteJob = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id FROM job_tracker WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Data lamaran tidak ditemukan.' });
    await db.query('DELETE FROM job_tracker WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Lamaran berhasil dihapus.' });
  } catch (err) { next(err); }
};

module.exports = { getJobs, getJobStats, createJob, updateJob, updateJobStatus, deleteJob };
