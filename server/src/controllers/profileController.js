const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM profile_settings LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profil belum dikonfigurasi.' });
    }

    // Ambil email admin secara dinamis
    const [userRows] = await db.query('SELECT email FROM users LIMIT 1');
    const email = userRows.length > 0 ? userRows[0].email : 'haikalmuhamad024@gmail.com';

    res.json({ success: true, data: { ...rows[0], email } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/profile
const updateProfile = async (req, res, next) => {
  try {
    const {
      hero_greeting, hero_title, hero_subtitle,
      cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url,
      stat_projects, stat_experience, stat_clients,
      about_title, about_text, github_url, linkedin_url, skills_marquee,
      email
    } = req.body;

    const [existing] = await db.query('SELECT id FROM profile_settings LIMIT 1');

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO profile_settings (hero_greeting, hero_title, hero_subtitle,
          cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url,
          stat_projects, stat_experience, stat_clients, about_title, about_text,
          github_url, linkedin_url, skills_marquee)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hero_greeting, hero_title, hero_subtitle, cta_primary_text, cta_primary_url,
          cta_secondary_text, cta_secondary_url, stat_projects, stat_experience, stat_clients,
          about_title, about_text, github_url, linkedin_url, skills_marquee]
      );
    } else {
      await db.query(
        `UPDATE profile_settings SET
          hero_greeting = ?, hero_title = ?, hero_subtitle = ?,
          cta_primary_text = ?, cta_primary_url = ?, cta_secondary_text = ?, cta_secondary_url = ?,
          stat_projects = ?, stat_experience = ?, stat_clients = ?,
          about_title = ?, about_text = ?, github_url = ?, linkedin_url = ?, skills_marquee = ?
         WHERE id = ?`,
        [hero_greeting, hero_title, hero_subtitle, cta_primary_text, cta_primary_url,
          cta_secondary_text, cta_secondary_url, stat_projects, stat_experience, stat_clients,
          about_title, about_text, github_url, linkedin_url, skills_marquee, existing[0].id]
      );
    }

    // Update email di tabel users jika dikirimkan
    if (email) {
      await db.query('UPDATE users SET email = ? ORDER BY id ASC LIMIT 1', [email.trim()]);
    }

    const [updated] = await db.query('SELECT * FROM profile_settings LIMIT 1');
    const [userRows] = await db.query('SELECT email FROM users LIMIT 1');
    const currentEmail = userRows.length > 0 ? userRows[0].email : 'hello@portfolio.com';

    res.json({ 
      success: true, 
      message: 'Profil berhasil diperbarui.', 
      data: { ...updated[0], email: currentEmail } 
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/profile/upload-photo
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Hapus foto lama
    const [rows] = await db.query('SELECT profile_image_url FROM profile_settings LIMIT 1');
    if (rows.length > 0 && rows[0].profile_image_url) {
      const oldPath = path.join(process.cwd(), rows[0].profile_image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const [existing] = await db.query('SELECT id FROM profile_settings LIMIT 1');
    if (existing.length === 0) {
      await db.query('INSERT INTO profile_settings (profile_image_url) VALUES (?)', [imageUrl]);
    } else {
      await db.query('UPDATE profile_settings SET profile_image_url = ? WHERE id = ?', [imageUrl, existing[0].id]);
    }

    res.json({ success: true, message: 'Foto profil berhasil diupload.', imageUrl });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/profile/upload-about-photo
const uploadAboutPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const [existing] = await db.query('SELECT id FROM profile_settings LIMIT 1');
    if (existing.length === 0) {
      await db.query('INSERT INTO profile_settings (about_image_url) VALUES (?)', [imageUrl]);
    } else {
      await db.query('UPDATE profile_settings SET about_image_url = ? WHERE id = ?', [imageUrl, existing[0].id]);
    }
    res.json({ success: true, message: 'Foto about berhasil diupload.', imageUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto, uploadAboutPhoto };
