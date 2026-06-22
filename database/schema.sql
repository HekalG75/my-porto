-- ============================================
--  PORTFOLIO DATABASE SCHEMA
--  Database: portfolio_db
-- ============================================

CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- ============================================
-- Table: users
-- Untuk autentikasi admin
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: profile_settings
-- Menyimpan konten hero section & statistik
-- ============================================
CREATE TABLE IF NOT EXISTS profile_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hero_greeting VARCHAR(100) DEFAULT 'Hello There!',
  hero_title VARCHAR(255) NOT NULL DEFAULT 'Full Stack Developer',
  hero_subtitle TEXT,
  profile_image_url VARCHAR(500),
  cta_primary_text VARCHAR(100) DEFAULT 'View My Portfolio',
  cta_primary_url VARCHAR(500) DEFAULT '#projects',
  cta_secondary_text VARCHAR(100) DEFAULT 'Hire Me',
  cta_secondary_url VARCHAR(500) DEFAULT '#contact',
  stat_projects INT DEFAULT 0,
  stat_experience INT DEFAULT 0,
  stat_clients INT DEFAULT 0,
  about_title VARCHAR(255) DEFAULT 'The Story Behind Me',
  about_text TEXT,
  about_image_url VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table: services
-- Grid layanan yang ditawarkan
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100) DEFAULT 'Code',
  order_index INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: projects
-- Portfolio project showcase
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack VARCHAR(500),
  image_url VARCHAR(500),
  project_url VARCHAR(500),
  github_url VARCHAR(500),
  category VARCHAR(100) DEFAULT 'Web',
  is_featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: certificates
-- Sertifikat profesional
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE,
  credential_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: job_tracker
-- Pelacak lamaran kerja
-- ============================================
CREATE TABLE IF NOT EXISTS job_tracker (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  status ENUM('Applied', 'Interviewing', 'Offered', 'Rejected') DEFAULT 'Applied',
  applied_date DATE NOT NULL,
  notes TEXT,
  job_url VARCHAR(500),
  salary_range VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA: Default Admin User
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@portfolio.com', '$2a$10$QD6juqys5/tbzfJJOMyS0e4fMzmXUgP8SrXbQiuOIE6JwLbD/Azlu');

-- ============================================
-- SEED DATA: Default Profile Settings
-- ============================================
INSERT INTO profile_settings (
  hero_greeting, hero_title, hero_subtitle,
  cta_primary_text, cta_secondary_text,
  stat_projects, stat_experience, stat_clients,
  about_title, about_text
) VALUES (
  'Hello There! 👋',
  'Full Stack Developer That Drives Results',
  'Saya membangun aplikasi web modern yang scalable dan beautiful. Spesialis dalam React, Node.js, dan arsitektur cloud.',
  'View My Portfolio', 'Hire Me',
  50, 3, 20,
  'The Story Behind Me',
  'Seorang Full Stack Developer yang bersemangat dalam membangun solusi digital yang inovatif. Berpengalaman dalam teknologi modern dan selalu belajar hal baru.'
);

-- ============================================
-- SEED DATA: Services
-- ============================================
INSERT INTO services (title, description, icon_name, order_index) VALUES
('Web Development', 'Membangun website modern, responsive, dan performant menggunakan teknologi terkini.', 'Globe', 1),
('UI/UX Design', 'Merancang antarmuka yang intuitif dan pengalaman pengguna yang luar biasa.', 'Palette', 2),
('Mobile App', 'Mengembangkan aplikasi mobile cross-platform yang smooth dan user-friendly.', 'Smartphone', 3),
('Backend API', 'Membangun RESTful API yang scalable dan aman untuk mendukung aplikasi Anda.', 'Server', 4),
('Database Design', 'Merancang skema database yang efisien dan mengoptimalkan query performance.', 'Database', 5),
('Cloud & DevOps', 'Deploy dan manajemen infrastruktur cloud menggunakan Docker, AWS, atau GCP.', 'Cloud', 6);

-- ============================================
-- SEED DATA: Sample Projects
-- ============================================
INSERT INTO projects (title, description, tech_stack, category, is_featured) VALUES
('E-Commerce Platform', 'Platform e-commerce full-stack dengan fitur cart, payment, dan dashboard admin.', 'React,Node.js,MySQL,Stripe', 'Web', 1),
('Task Management App', 'Aplikasi manajemen tugas dengan real-time collaboration menggunakan Socket.IO.', 'React,Express,MongoDB,Socket.IO', 'Web', 1),
('Portfolio CMS', 'Content Management System untuk portfolio developer dengan admin panel.', 'Next.js,Prisma,PostgreSQL', 'Web', 0);
