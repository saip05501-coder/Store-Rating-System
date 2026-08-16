-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: store_rating_system
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int unsigned DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS',
  `details` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user_id` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `idx_audit_created_at` (`created_at`),
  KEY `idx_audit_status` (`status`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'ADMIN_LOGIN_SUCCESS','AUTH',1,'Administrator logged into the management portal','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0','SUCCESS','{\"role\": \"admin\", \"method\": \"PASSWORD_AUTH\"}','2026-08-15 22:40:36'),(2,1,'STORE_CREATED','STORE',7,'Administrator registered new store: Apex Electronics Superstore','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0','SUCCESS','{\"owner_id\": 12, \"storeName\": \"Apex Electronics Superstore\"}','2026-08-15 22:40:36'),(3,13,'USER_LOGIN_SUCCESS','AUTH',13,'user logged in: user1@storerating.com','127.0.0.1',NULL,'SUCCESS','{\"role\": \"user\", \"email\": \"user1@storerating.com\"}','2026-08-15 22:40:51'),(4,12,'OWNER_LOGIN_SUCCESS','AUTH',12,'owner logged in: owner@storerating.com','127.0.0.1',NULL,'SUCCESS','{\"role\": \"owner\", \"email\": \"owner@storerating.com\"}','2026-08-15 22:40:51'),(5,1,'ADMIN_LOGIN_FAILED','AUTH',1,'Failed login attempt — incorrect password for admin@storerating.com (admin)','127.0.0.1',NULL,'FAILED','{\"role\": \"admin\", \"email\": \"admin@storerating.com\"}','2026-08-15 22:40:51'),(6,1,'ADMIN_LOGIN_SUCCESS','AUTH',1,'Administrator logged in: admin@storerating.com','127.0.0.1',NULL,'SUCCESS','{\"role\": \"admin\", \"email\": \"admin@storerating.com\"}','2026-08-15 22:40:52'),(7,1,'USER_CREATED','USER',30,'Administrator created user account: Audit Test User (audittest_76198@test.com)','127.0.0.1',NULL,'SUCCESS','{\"name\": \"Audit Test User\", \"role\": \"user\", \"email\": \"audittest_76198@test.com\", \"createdUserId\": 30}','2026-08-15 22:40:53'),(8,1,'STORE_CREATED','STORE',18,'Administrator created store: Audit Store 76198','127.0.0.1',NULL,'SUCCESS','{\"name\": \"Audit Store 76198\", \"email\": \"auditstore_76198@store.com\", \"ownerId\": null, \"storeId\": 18, \"ownerName\": null}','2026-08-15 22:40:53'),(9,1,'STORE_UPDATED','STORE',18,'Store details updated for: Audit Store Updated 76198','127.0.0.1',NULL,'SUCCESS','{\"name\": \"Audit Store Updated 76198\", \"email\": \"auditstore_76198@store.com\", \"ownerId\": null, \"storeId\": 18}','2026-08-15 22:40:53'),(10,1,'STORE_DELETED','STORE',18,'Store #18 was deleted permanently','127.0.0.1',NULL,'SUCCESS','{\"deletedStoreId\": \"18\"}','2026-08-15 22:40:53'),(11,1,'ADMIN_LOGIN_SUCCESS','AUTH',1,'Administrator logged in: admin@storerating.com','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','SUCCESS','{\"role\": \"admin\", \"email\": \"admin@storerating.com\"}','2026-08-15 22:42:07'),(12,NULL,'LOGIN_FAILED','AUTH',NULL,'Failed login attempt — account not found for email: alicejohnsonshopper@gmail.com','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','FAILED','{\"attemptedEmail\": \"alicejohnsonshopper@gmail.com\"}','2026-08-15 22:45:56'),(13,5,'USER_LOGIN_SUCCESS','AUTH',5,'user logged in: manemahesh101@gmail.com','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','SUCCESS','{\"role\": \"user\", \"email\": \"manemahesh101@gmail.com\"}','2026-08-15 22:46:23'),(14,1,'ADMIN_LOGIN_SUCCESS','AUTH',1,'Administrator logged in: admin@storerating.com','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','SUCCESS','{\"role\": \"admin\", \"email\": \"admin@storerating.com\"}','2026-08-15 22:47:26');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `store_id` int unsigned NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ratings_user_store` (`user_id`,`store_id`),
  KEY `idx_ratings_store` (`store_id`),
  KEY `idx_ratings_user` (`user_id`),
  CONSTRAINT `fk_ratings_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_rating_value` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,8,3,5,'2026-08-14 14:54:20','2026-08-14 23:33:04'),(2,8,4,4,'2026-08-14 14:54:20','2026-08-14 23:33:04'),(3,9,3,4,'2026-08-14 14:54:20','2026-08-14 23:33:04'),(4,9,5,5,'2026-08-14 14:54:21','2026-08-14 23:33:04'),(5,10,4,5,'2026-08-14 14:54:21','2026-08-14 23:33:04'),(6,10,6,4,'2026-08-14 14:54:21','2026-08-14 23:33:04'),(7,5,6,1,'2026-08-14 14:56:36','2026-08-14 22:55:12'),(9,5,4,2,'2026-08-14 15:01:20','2026-08-14 15:01:20'),(10,5,3,3,'2026-08-14 15:01:50','2026-08-14 15:01:50'),(11,13,7,5,'2026-08-14 15:29:59','2026-08-14 15:29:59'),(12,13,9,4,'2026-08-14 15:34:58','2026-08-14 15:34:58'),(13,13,10,4,'2026-08-14 15:35:25','2026-08-14 15:35:25'),(14,5,8,5,'2026-08-14 15:50:26','2026-08-14 15:50:26'),(15,5,7,5,'2026-08-14 22:54:49','2026-08-14 22:55:02'),(24,5,15,5,'2026-08-15 00:12:01','2026-08-15 00:12:01');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `store_ratings_summary`
--

DROP TABLE IF EXISTS `store_ratings_summary`;
/*!50001 DROP VIEW IF EXISTS `store_ratings_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `store_ratings_summary` AS SELECT 
 1 AS `store_id`,
 1 AS `store_name`,
 1 AS `store_email`,
 1 AS `store_address`,
 1 AS `owner_id`,
 1 AS `owner_name`,
 1 AS `rating_count`,
 1 AS `avg_rating`,
 1 AS `created_at`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stores_email` (`email`),
  KEY `idx_stores_owner` (`owner_id`),
  KEY `idx_stores_name` (`name`),
  CONSTRAINT `fk_stores_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (3,'The Green Basket Market','demo.greenbasket@example.com','12 Orchard Lane, Mumbai',6,'2026-08-14 14:54:20','2026-08-14 14:54:20'),(4,'Harbour Coffee Roasters','demo.harbourcoffee@example.com','8 Seaside Drive, Mumbai',6,'2026-08-14 14:54:20','2026-08-14 14:54:20'),(5,'Willow Book and Home','demo.willow@example.com','42 Lake View Road, Pune',7,'2026-08-14 14:54:20','2026-08-14 14:54:20'),(6,'Sunrise Artisan Bakery','demo.sunrise@example.com','5 River Road, Pune',7,'2026-08-14 14:54:20','2026-08-14 14:54:20'),(7,'Apex Electronics Superstore','contact@apexelectronics.com','458 Market Street, Downtown, Suite 100',12,'2026-08-14 15:29:59','2026-08-14 15:29:59'),(8,'Boutique Fashion Emporium','info@boutiquefashion.com','12 Luxury Avenue, Fashion District',NULL,'2026-08-14 15:29:59','2026-08-14 15:29:59'),(9,'Test Grand Store Location','teststore_1786701897799@storerating.com','99 Commercial Boulevard, City Center',12,'2026-08-14 15:34:57','2026-08-14 15:34:57'),(10,'Test Grand Store Location','teststore_1786701924756@storerating.com','99 Commercial Boulevard, City Center',12,'2026-08-14 15:35:24','2026-08-14 15:35:24'),(15,'Om_Suppliers','om_suppliers@gmail.com','Ishwarpur',26,'2026-08-15 00:09:39','2026-08-15 00:09:39');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','owner','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Administrator Account','admin@storerating.com','$2a$12$bmq2x2rx8uXJKaud/x3pR.XTX7Dx9jU5RPtdBYi9HsQqQ32QWWYP6','100 HQ Boulevard, Tech Park','admin','2026-08-13 23:17:54','2026-08-14 15:29:59'),(5,'Mahesh Narayan Mane','manemahesh101@gmail.com','$2a$12$IMcQ0YBUdrKpnHZhihwS6u0.ws4Nbr2oarYyMb/0X3zGc0mK3u5pe',NULL,'user','2026-08-14 14:45:00','2026-08-14 14:45:00'),(6,'Alexandra Morgan Bennett','demo.owner.bennett@example.com','$2a$12$x9bsLbYYVJsjgYedjUi/X.R2NRN9X/TOi2m3JhiDZCqDzlYeJZYF6','18 Orchard Lane, Mumbai','owner','2026-08-14 14:54:20','2026-08-14 14:54:20'),(7,'Christopher James Wilson','demo.owner.wilson@example.com','$2a$12$x9bsLbYYVJsjgYedjUi/X.R2NRN9X/TOi2m3JhiDZCqDzlYeJZYF6','44 Lake View Road, Pune','owner','2026-08-14 14:54:20','2026-08-14 14:54:20'),(8,'Priyanka Sharma Kulkarni','demo.user.priyanka@example.com','$2a$12$x9bsLbYYVJsjgYedjUi/X.R2NRN9X/TOi2m3JhiDZCqDzlYeJZYF6','9 Park Street, Mumbai','user','2026-08-14 14:54:20','2026-08-14 14:54:20'),(9,'Rohan Mehta Deshmukh','demo.user.rohan@example.com','$2a$12$x9bsLbYYVJsjgYedjUi/X.R2NRN9X/TOi2m3JhiDZCqDzlYeJZYF6','22 River Road, Pune','user','2026-08-14 14:54:20','2026-08-14 14:54:20'),(10,'Samantha Grace Thompson','demo.user.samantha@example.com','$2a$12$x9bsLbYYVJsjgYedjUi/X.R2NRN9X/TOi2m3JhiDZCqDzlYeJZYF6','71 Market Lane, Bengaluru','user','2026-08-14 14:54:20','2026-08-14 14:54:20'),(12,'Store Owner Account User','owner@storerating.com','$2a$10$BtK8bpLrZ8hY2G6QPWTbCOtGhe2yYMZ9YxU6gfxO8jk41BxWGwbsW','200 Retail Way, Commerce City','owner','2026-08-14 15:29:59','2026-08-14 15:29:59'),(13,'Normal User Johnathan Doe','user1@storerating.com','$2a$10$rl3IRQMKQGJ2VPg.i9/TWu.tM6QEeJFHtIg.86aXskqNy5xHgKaP.','300 Residential St, Suburbia','user','2026-08-14 15:29:59','2026-08-14 15:29:59'),(14,'Testing Normal User Account Name','testuser_1786701897083@storerating.com','$2a$12$vbPOCyfW9nL.qsteM8ovwutf0BqZSbxMq7GyHV0zQERe2NUzKOf4i','123 Test Street, Test City','user','2026-08-14 15:34:57','2026-08-14 15:34:57'),(15,'Publicly Registered User Account','publicuser_1786701897829@storerating.com','$2a$12$iHz/Sviu3pk9u6gkcFJWd.o7uImjFxFH27dbCOI0C/DHNTzOtwhsO','77 Public Way, Townsville','user','2026-08-14 15:34:58','2026-08-14 15:34:59'),(16,'Testing Normal User Account Name','testuser_1786701924137@storerating.com','$2a$12$7OY3P/T5Hqm64QLJ.fq4kOshE9FN/IVRKOO3c6UFvYWHkwz3B/jty','123 Test Street, Test City','user','2026-08-14 15:35:24','2026-08-14 15:35:24'),(17,'Publicly Registered User Account','publicuser_1786701924776@storerating.com','$2a$12$sz7ij6snRwfxdm.pT7jwa.hJrFLzutfNTo5I9s6VmME5q7ti6xAL.','77 Public Way, Townsville','user','2026-08-14 15:35:25','2026-08-14 15:35:26'),(18,'Rajwardhan Harshwardhan BhosalePatil','manemahesh8055@gmail.com','$2a$12$gDeVZWwGh9G8o.JMK86ht.hfwyPS1Bvq4JKaaUXVbHfY/Lmrw2DEa',NULL,'admin','2026-08-14 19:52:03','2026-08-14 19:52:03'),(19,'Sujata Narayan Mane','sujatamane1112@gmail.com','$2a$12$Tvx8Hw1G2I.Ib3eIpW4PYeyX3emNYRrT331tElWoLPQBnrL2Dc79.',NULL,'admin','2026-08-14 23:29:48','2026-08-14 23:29:48'),(20,'Pawan Anil Rajput','rajput801092@gmail.com','$2a$12$dC2wM8hhlHTgBUmPxj4x1.2RdzC2Gq2obx9NdcYaGd78vz7dr9tBy',NULL,'admin','2026-08-14 23:32:21','2026-08-14 23:32:21'),(26,'Om Bhosale','ombhosale2026@gmail.com','$2a$12$NEyuGPXH8WXYDqTrRukwbuLOkljzm0th6Nn4GBsdy07pgxX0Ct0pK','Pandharpur','owner','2026-08-15 00:09:39','2026-08-15 00:09:39'),(30,'Audit Test User','audittest_76198@test.com','$2a$12$ISc0Eq.pyopsbL6TtQFJyO.0DSRGbGGBNnQJQ6c6SSVNjI8AynG7u','123 Audit Way','user','2026-08-15 22:40:53','2026-08-15 22:40:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `store_ratings_summary`
--

/*!50001 DROP VIEW IF EXISTS `store_ratings_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `store_ratings_summary` AS select `s`.`id` AS `store_id`,`s`.`name` AS `store_name`,`s`.`email` AS `store_email`,`s`.`address` AS `store_address`,`s`.`owner_id` AS `owner_id`,`u`.`name` AS `owner_name`,count(`r`.`id`) AS `rating_count`,coalesce(avg(`r`.`rating`),0) AS `avg_rating`,`s`.`created_at` AS `created_at`,`s`.`updated_at` AS `updated_at` from ((`stores` `s` left join `users` `u` on((`u`.`id` = `s`.`owner_id`))) left join `ratings` `r` on((`r`.`store_id` = `s`.`id`))) group by `s`.`id`,`s`.`name`,`s`.`email`,`s`.`address`,`s`.`owner_id`,`u`.`name`,`s`.`created_at`,`s`.`updated_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-16 13:58:21
