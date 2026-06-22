const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Multer error handling
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
  }

  if (err.code === 'LIMIT_FIELD_VALUE') {
    return res.status(400).json({ success: false, message: 'Ukuran teks/gambar yang disisipkan di deskripsi terlalu besar (Maksimal 20MB).' });
  }

  if (err.message && err.message.includes('Hanya file gambar')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Data sudah ada. Gunakan nilai yang berbeda.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
  });
};

module.exports = errorHandler;
