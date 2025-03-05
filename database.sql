-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: cosa
-- ------------------------------------------------------
-- Server version	9.0.0-commercial

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `error_logs`
--

DROP TABLE IF EXISTS `error_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `error_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `line_number` int DEFAULT NULL,
  `error_message` text NOT NULL,
  `error_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `error_logs_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `error_logs`
--

LOCK TABLES `error_logs` WRITE;
/*!40000 ALTER TABLE `error_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `error_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_participants`
--

DROP TABLE IF EXISTS `exam_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `delete_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `exam_participants_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_participants`
--

LOCK TABLES `exam_participants` WRITE;
/*!40000 ALTER TABLE `exam_participants` DISABLE KEYS */;
INSERT INTO `exam_participants` VALUES (1,1,6,'2025-02-25 00:32:12',NULL);
/*!40000 ALTER TABLE `exam_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_tasks`
--

DROP TABLE IF EXISTS `exam_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `task_title` varchar(255) NOT NULL,
  `task_description` text NOT NULL,
  `max_score` float NOT NULL,
  `execution_time_limit` float NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `delete_at` datetime DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_tasks_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_tasks`
--

LOCK TABLES `exam_tasks` WRITE;
/*!40000 ALTER TABLE `exam_tasks` DISABLE KEYS */;
INSERT INTO `exam_tasks` VALUES (1,1,'Bài 1','Số lớn thứ 2',10,0.9,'2025-02-25 02:08:22',NULL,'Screenshot_2025-02-25_011953.png');
/*!40000 ALTER TABLE `exam_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_by` int NOT NULL,
  `status` enum('scheduled','ongoing','completed') DEFAULT 'scheduled',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (1,'Olympic Lập trình lần VII','asdasd','2025-02-25 12:00:00','2025-02-26 00:00:00',3,'ongoing','2025-01-01 13:00:00','2025-02-24 17:32:02'),(2,'Kỳ thi Python Cơ bản','python cơ bản','2025-02-16 14:10:00','2025-02-18 20:00:00',4,'completed','2025-01-03 08:00:00','2025-02-25 00:25:31'),(3,'Kỳ thi Python Cơ bản lần 2','Test','2025-02-16 14:10:00','2025-01-19 11:40:00',1,'completed','2025-01-14 17:39:07','2025-02-16 14:36:16');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `total_score` float DEFAULT '0',
  `graded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `scores_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `exam_task_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `execution_time` float DEFAULT NULL,
  `file_path_code` varchar(255) NOT NULL,
  `is_graded` tinyint DEFAULT '0',
  `score` float DEFAULT '0',
  `output` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `exam_task_id` (`exam_task_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`exam_task_id`) REFERENCES `exam_tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testcases`
--

DROP TABLE IF EXISTS `testcases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testcases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_task_id` int NOT NULL,
  `input_path` varchar(255) NOT NULL,
  `output_path` varchar(255) NOT NULL,
  `time_limit` float NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `exam_task_id` (`exam_task_id`),
  CONSTRAINT `testcases_ibfk_1` FOREIGN KEY (`exam_task_id`) REFERENCES `exam_tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testcases`
--

LOCK TABLES `testcases` WRITE;
/*!40000 ALTER TABLE `testcases` DISABLE KEYS */;
INSERT INTO `testcases` VALUES (1,1,'SOLON2.INP','SOLON2.OUT',0.9,'2025-02-25 02:08:22');
/*!40000 ALTER TABLE `testcases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','scrypt:32768:8:1$L9zb6dv2fnV1oIxU$1a0a0c9306e9d7d4d7675cc5100689c99162fe6ebf6305069f6bb19eaa89caae58a8b501daa3cc69b1ee98fd13685e0d68502adca68f909b882ce61ec64d2737','admin','Ma Bách Duy','0985725835','bachduyatk300@gmail.com','2025-01-11 17:27:23',NULL,NULL),(2,'user1','scrypt:32768:8:1$dbYEz4phKeFNISv8$ba2c61887ddfbaa5c43affa428dd6b036bcf1e77211602be54e4513d3c262c23338885f7fb7e96d27926c5966a384fd1264d38f99b7a9cc993567492fd1af480','student','Nguyễn A',NULL,NULL,'2025-01-11 17:30:26',NULL,'2025-01-11 18:12:12'),(3,'teacher1','scrypt:32768:8:1$rkWO8Sv9DnAUpmhi$ad41239f396700e07cf0d07a81f5228818c68ea464b6e4c0bce3f642279aef9c66e0b111bb3a5533ce98ad45639aac263fc166a064ca7a61c7bf153a059298d1','teacher','Giáo Viên 1','0123456789','teacher1@gmail.com','2025-01-11 17:33:05','2025-01-14 17:04:37',NULL),(4,'teacher2','scrypt:32768:8:1$AVnd0nwOOxj3XfDr$53ee88ff3b161a2df1b45268b05b844f369d6c87e9be91e448abf3123230d124a594158042a45702438ebd75ae16c97a23527128b3f3ebd855fb465c231591c3','teacher','Giáo Viên 2',NULL,'teacher2@gmail.com','2025-01-11 17:33:30',NULL,NULL),(5,'teacher3','scrypt:32768:8:1$8XpAveH61Qkoo52O$ae9a060425a4af63a75c0d62ca433a227a3c646f8748e44a9a27ee358ff9a898063399ad69aeca978397c460fa13c70d939321fc63aed1331f6df7d5f37c1329','teacher','Giáo Viên 3',NULL,'teacher3@gmail.com','2025-01-11 17:33:51',NULL,NULL),(6,'student1','scrypt:32768:8:1$sl8uxh5UFXbV4zZh$3e04af495e93a6094dd4b5e0542101c644d1dd6a1b9a2569e0e02ffca010ce691bc03ff840d3ca46fba56b407166eb9d1de7998e6c8a531b151cb3cfcb07928c','student','Sinh Viên 1','0123456654','sv1@gmail.com','2025-01-11 18:08:03','2025-01-14 18:01:09',NULL),(7,'admin1','scrypt:32768:8:1$98yNHWzEaFJVzAYM$8226a954d2dd021576e283bfea4f6b4b02f6a2ae633646fe0374205e9f55c72ae90735776f522050b27e99e2817ef94c5f654911430fdb421f5dcf4d7fda4de9','admin','Admin 2','0123222222','admin2@gmail.com','2025-01-11 18:08:30',NULL,NULL),(8,'student2','scrypt:32768:8:1$OP8t4PtCUEB8Retl$461e2fcb3ba73ed28e4419b45d740b8c40915f984553e227aef50995c322c1f3ae9441b69974c410122595c770a8b61f1a630a51aeb45462d62c5a03c24464dc','student','Sinh Viên 2',NULL,NULL,'2025-01-11 18:10:35',NULL,NULL),(9,'student3','scrypt:32768:8:1$FJIW6fcMmtrQD0Bw$e156bb0f4980401091bc837a2e15fd0420c929cd4d350f4d739a5fa7198e841efd19617806aaafc8d9ae4c5dca9f94f8c0ff1a211224ca8a28286dc03d15659e','student','Sinh Viên 3',NULL,NULL,'2025-01-11 18:11:02',NULL,NULL),(10,'student4','scrypt:32768:8:1$SBvR1tqVm98oMQ26$a35ea7cf65c553e488f9365bb2109b491981ac65db79dbf5824dc2489705957505ba1d3a7d8ee7fd5c87c15c9f095545562ef6b73f04eee19e454307fe2b40d9','student','Sinh Viên 4',NULL,NULL,'2025-01-11 18:11:22',NULL,NULL),(11,'student5','scrypt:32768:8:1$7EiZP4uJfU9XymYb$5d4f49b412c06771e6fff1ed2f7186d7faeb39001e1a51434330142c934c4afe6b79c72d4f38d6b92951a75a9efe2b1b7f1a96640b2f78e9dca370ddaced9e12','student','Sinh Viên 5','0123555555','sv5@gmail.com','2025-01-11 18:11:57','2025-01-14 18:54:27',NULL),(12,'admin2','scrypt:32768:8:1$hPuHd5IlhWITzI0N$b573b7dbedcfcfb955fa18fbacd51f0b44e2a20004058af620aa32eef369b47dcbbc4b2f8885e005c14189943e5336cfd5f865d7b58479b0b270f830df8d7174','admin','Admin 3','0123111111','admin3@gmail.com','2025-01-11 18:13:36',NULL,NULL),(13,'student6','scrypt:32768:8:1$DtQNO9DjHHhJMCe0$cf1e44c46a27759172def9370d36d4e39988cd51f7668572e42285ea5bf75924e617f2a7b1858431b674d5814d1fa32c008f9f5c5ebdd72d752f0071954b3b0d','student','Sinh Viên 6','0123666666','sv6@gmail.com','2025-01-14 16:52:09',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-04 22:22:17
