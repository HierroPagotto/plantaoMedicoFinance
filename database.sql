-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.33 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             12.7.0.6850
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table plantao.doctors
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `crm` varchar(20) DEFAULT NULL,
  `crm_state` varchar(2) DEFAULT NULL,
  `graduation_year` int(11) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `main_specialty` varchar(100) DEFAULT NULL,
  `procedures` text,
  `shift_types` text,
  `preferred_periods` text,
  `preferred_days` text,
  `accepts_fixed_shifts` tinyint(1) DEFAULT NULL,
  `accepts_temporary_shifts` tinyint(1) DEFAULT NULL,
  `max_distance_km` int(11) DEFAULT NULL,
  `state` varchar(2) DEFAULT NULL,
  `cities_of_work` text,
  `acls` tinyint(1) DEFAULT NULL,
  `bls` tinyint(1) DEFAULT NULL,
  `atls` tinyint(1) DEFAULT NULL,
  `pals` tinyint(1) DEFAULT NULL,
  `other_certifications` varchar(255) DEFAULT NULL,
  `main_hospitals` varchar(500) DEFAULT NULL,
  `years_of_experience` varchar(10) DEFAULT NULL,
  `has_driver_license` tinyint(1) DEFAULT NULL,
  `has_ehr_experience` tinyint(1) DEFAULT NULL,
  `provides_invoice` tinyint(1) DEFAULT NULL,
  `languages` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `crm` (`crm`),
  KEY `ix_doctors_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table plantao.doctors: ~2 rows (approximately)
INSERT INTO `doctors` (`id`, `name`, `photo_url`, `email`, `password`, `crm`, `crm_state`, `graduation_year`, `city`, `phone`, `main_specialty`, `procedures`, `shift_types`, `preferred_periods`, `preferred_days`, `accepts_fixed_shifts`, `accepts_temporary_shifts`, `max_distance_km`, `state`, `cities_of_work`, `acls`, `bls`, `atls`, `pals`, `other_certifications`, `main_hospitals`, `years_of_experience`, `has_driver_license`, `has_ehr_experience`, `provides_invoice`, `languages`, `created_at`, `updated_at`) VALUES
	(1, 'Paulo Mohammed', 'http://127.0.0.1:5000//static/uploads/20250512180734_d79939fade3543d4b0508cf5f350672b.jpg', 'paulo@plexiotech.com', '$2b$12$bjOrH3SagR1gH3R1Ly.LuekZVAxGXLJW/ZDdeZF0WMu0vVz/cTWgy', '123456', 'MS', 2025, 'Campinas', '(85) 99924-8941', 'Medicina de família', 'Exemplo de Procedimento, Sutura, Cardioversão, Pequenas cirurgias', 'Dia, Telemedicina', 'Manhã, 12 horas', 'Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira', 1, 1, 15, 'SP', 'Campinas, São Paulo', 0, 1, 0, 0, '', '', '', 0, 0, 1, '', '2025-05-11 04:00:19', '2025-05-12 18:07:34'),
	(9, 'Paulo Rodrigues Novo', NULL, 'paulo@wnfstudios.com', '$2b$12$byhWt0SMke3dpEWX684OG.IsKaWT9pMEql50T3d8Bo89icWV.Uqo6', NULL, NULL, NULL, NULL, NULL, 'Clínica Médica', NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, 0, 0, NULL, '2025-05-11 19:20:04', NULL);

-- Dumping structure for table plantao.hospitals
CREATE TABLE IF NOT EXISTS `hospitals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_hospitals_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table plantao.hospitals: ~2 rows (approximately)
INSERT INTO `hospitals` (`id`, `name`, `address`, `latitude`, `longitude`, `created_at`) VALUES
	(1, 'Hospital São Lucas', 'Av. Brasil, 1234 - Campinas, SP', -22.9056, -47.0608, '2025-05-11 04:09:24'),
	(2, 'Santa Casa', 'Endereço não especificado', 0, 0, '2025-05-11 23:01:17');

-- Dumping structure for table plantao.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shift_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `payment_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shift_id` (`shift_id`),
  KEY `ix_payments_id` (`id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table plantao.payments: ~3 rows (approximately)
INSERT INTO `payments` (`id`, `shift_id`, `amount`, `status`, `payment_date`, `created_at`, `updated_at`) VALUES
	(2, 4, 350.00, 'paid', '2025-05-12 18:47:27', '2025-05-11 04:49:01', '2025-05-12 15:47:26'),
	(3, 5, 500.00, 'pending', NULL, '2025-05-12 00:15:02', NULL),
	(4, 6, 450.00, 'pending', NULL, '2025-05-12 00:18:56', NULL);

-- Dumping structure for table plantao.shifts
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` int(11) NOT NULL,
  `hospital_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `hospital_id` (`hospital_id`),
  KEY `ix_shifts_id` (`id`),
  CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `shifts_ibfk_2` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table plantao.shifts: ~3 rows (approximately)
INSERT INTO `shifts` (`id`, `doctor_id`, `hospital_id`, `date`, `start_time`, `end_time`, `value`, `specialty`, `payment_date`, `status`, `created_at`, `updated_at`) VALUES
	(4, 1, 1, '2025-05-20', '08:00:00', '09:00:00', 350.00, 'Cardiologista', '2025-05-11', 'paid', '2025-05-11 04:49:01', '2025-05-12 15:47:26'),
	(5, 1, 2, '2025-05-14', '00:10:00', '01:10:00', 500.00, 'Geriatria', '2025-05-13', 'completed', '2025-05-12 00:15:02', '2025-05-12 15:48:28'),
	(6, 1, 2, '2025-05-15', '10:00:00', '13:00:00', 450.00, 'Endocrinologia', '2025-05-16', 'scheduled', '2025-05-12 00:18:56', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
