-- Unibox MySQL 初始化脚本
-- 对应 prisma/schema.prisma，并写入默认角色与账号
-- 默认账号：
--   超级管理员  admin@unibox.com / Admin1234
--   演示用户    demo@unibox.com  / Demo1234
--
-- 用法示例：
--   mysql -u unibox -punibox123 unibox < prisma/init.sql
-- 或挂载到 Docker MySQL：
--   ./prisma/init.sql -> /docker-entrypoint-initdb.d/init.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Message`;
DROP TABLE IF EXISTS `Conversation`;
DROP TABLE IF EXISTS `Task`;
DROP TABLE IF EXISTS `UserInvite`;
DROP TABLE IF EXISTS `UserNotifications`;
DROP TABLE IF EXISTS `UserAccount`;
DROP TABLE IF EXISTS `UserProfile`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `Role`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------

CREATE TABLE `Role` (
  `id`          VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `label`       VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `permissions` TEXT         NOT NULL,
  `isSystem`    TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `User` (
  `id`           VARCHAR(191) NOT NULL,
  `accountNo`    VARCHAR(191) NOT NULL,
  `firstName`    VARCHAR(191) NOT NULL,
  `lastName`     VARCHAR(191) NOT NULL,
  `username`     VARCHAR(191) NOT NULL,
  `email`        VARCHAR(191) NOT NULL,
  `phoneNumber`  VARCHAR(191) NOT NULL DEFAULT '',
  `passwordHash` VARCHAR(191) NOT NULL,
  `status`       VARCHAR(191) NOT NULL DEFAULT 'active',
  `role`         VARCHAR(191) NOT NULL DEFAULT 'user',
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_accountNo_key` (`accountNo`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserProfile` (
  `id`           VARCHAR(191) NOT NULL,
  `userId`       VARCHAR(191) NOT NULL,
  `username`     VARCHAR(191) NULL,
  `displayEmail` VARCHAR(191) NULL,
  `bio`          VARCHAR(191) NOT NULL DEFAULT '',
  `urls`         VARCHAR(191) NOT NULL DEFAULT '[]',
  `updatedAt`    DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserProfile_userId_key` (`userId`),
  CONSTRAINT `UserProfile_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserAccount` (
  `id`        VARCHAR(191) NOT NULL,
  `userId`    VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL DEFAULT '',
  `dob`       DATETIME(3)  NULL,
  `language`  VARCHAR(191) NOT NULL DEFAULT 'zh',
  `updatedAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserAccount_userId_key` (`userId`),
  CONSTRAINT `UserAccount_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserNotifications` (
  `id`                  VARCHAR(191) NOT NULL,
  `userId`              VARCHAR(191) NOT NULL,
  `type`                VARCHAR(191) NOT NULL DEFAULT 'mentions',
  `mobile`              TINYINT(1)   NOT NULL DEFAULT 0,
  `communicationEmails` TINYINT(1)   NOT NULL DEFAULT 0,
  `socialEmails`        TINYINT(1)   NOT NULL DEFAULT 1,
  `marketingEmails`     TINYINT(1)   NOT NULL DEFAULT 0,
  `securityEmails`      TINYINT(1)   NOT NULL DEFAULT 1,
  `updatedAt`           DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserNotifications_userId_key` (`userId`),
  CONSTRAINT `UserNotifications_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UserInvite` (
  `id`          VARCHAR(191) NOT NULL,
  `email`       VARCHAR(191) NOT NULL,
  `role`        VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `invitedById` VARCHAR(191) NOT NULL,
  `status`      VARCHAR(191) NOT NULL DEFAULT 'pending',
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `UserInvite_invitedById_fkey`
    FOREIGN KEY (`invitedById`) REFERENCES `User` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Task` (
  `id`          VARCHAR(191) NOT NULL,
  `title`       VARCHAR(191) NOT NULL,
  `status`      VARCHAR(191) NOT NULL,
  `label`       VARCHAR(191) NOT NULL,
  `priority`    VARCHAR(191) NOT NULL,
  `assignee`    VARCHAR(191) NULL,
  `description` VARCHAR(191) NULL,
  `dueDate`     DATETIME(3)  NULL,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Conversation` (
  `id`       VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `title`    VARCHAR(191) NOT NULL,
  `avatar`   VARCHAR(191) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
  `id`             VARCHAR(191) NOT NULL,
  `conversationId` VARCHAR(191) NOT NULL,
  `sender`         VARCHAR(191) NOT NULL,
  `message`        VARCHAR(191) NOT NULL,
  `timestamp`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Message_conversationId_fkey`
    FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed: roles
-- ---------------------------------------------------------------------------

INSERT INTO `Role` (`id`, `name`, `label`, `description`, `permissions`, `isSystem`, `createdAt`, `updatedAt`) VALUES
(
  '00000000-0000-4000-8000-000000000011',
  'superadmin',
  '超级管理员',
  '系统超级管理员，拥有所有权限',
  '["menu:dashboard","menu:users","menu:tasks","menu:settings","menu:chats","menu:help-center","users:view","users:create","users:edit","users:delete","users:invite","tasks:view","tasks:create","tasks:edit","tasks:delete","tasks:import","settings:view","settings:edit","roles:view","roles:edit"]',
  1,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
),
(
  '00000000-0000-4000-8000-000000000012',
  'admin',
  '管理员',
  '系统管理员，可以管理用户和任务',
  '["menu:dashboard","menu:users","menu:tasks","menu:settings","menu:chats","menu:help-center","users:view","users:create","users:edit","users:delete","users:invite","tasks:view","tasks:create","tasks:edit","tasks:delete","tasks:import","settings:view","settings:edit","roles:view"]',
  1,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
),
(
  '00000000-0000-4000-8000-000000000013',
  'tenant',
  '租户',
  '租户用户，可以管理自己的任务',
  '["menu:dashboard","menu:tasks","menu:settings","menu:chats","menu:help-center","tasks:view","tasks:create","tasks:edit","tasks:delete","settings:view","settings:edit"]',
  0,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
),
(
  '00000000-0000-4000-8000-000000000014',
  'user',
  '用户',
  '普通用户，只能查看和操作自己的数据',
  '["menu:dashboard","menu:tasks","menu:settings","menu:chats","menu:help-center","tasks:view","settings:view","settings:edit"]',
  0,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
);

-- ---------------------------------------------------------------------------
-- Seed: default accounts
-- passwordHash: bcryptjs cost 10
--   Admin1234 -> $2b$10$11VPoggoDy1OGDdRRxuckeDUL/4575I2FR1l/PodwmIT4ntXv3Aqi
--   Demo1234  -> $2b$10$6.to36n25R27OSKsesaboeOOwdoPm2Dq/ZPorgfj01KHw3vqSwTtK
-- ---------------------------------------------------------------------------

INSERT INTO `User` (
  `id`, `accountNo`, `firstName`, `lastName`, `username`, `email`,
  `phoneNumber`, `passwordHash`, `status`, `role`, `createdAt`, `updatedAt`
) VALUES
(
  '00000000-0000-4000-8000-000000000001',
  'ACC001',
  'Admin',
  'User',
  'admin',
  'admin@unibox.com',
  '+86 138 0000 0001',
  '$2b$10$11VPoggoDy1OGDdRRxuckeDUL/4575I2FR1l/PodwmIT4ntXv3Aqi',
  'active',
  'superadmin',
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
),
(
  '00000000-0000-4000-8000-000000000002',
  'ACC002',
  'Demo',
  'User',
  'demo',
  'demo@unibox.com',
  '+86 138 0000 0002',
  '$2b$10$6.to36n25R27OSKsesaboeOOwdoPm2Dq/ZPorgfj01KHw3vqSwTtK',
  'active',
  'user',
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
);

INSERT INTO `UserProfile` (
  `id`, `userId`, `username`, `displayEmail`, `bio`, `urls`, `updatedAt`
) VALUES (
  '00000000-0000-4000-8000-000000000021',
  '00000000-0000-4000-8000-000000000001',
  'admin',
  'admin@unibox.com',
  'Unibox 系统管理员',
  '[{"value":"https://unibox.com"}]',
  CURRENT_TIMESTAMP(3)
);

INSERT INTO `UserAccount` (
  `id`, `userId`, `name`, `dob`, `language`, `updatedAt`
) VALUES (
  '00000000-0000-4000-8000-000000000031',
  '00000000-0000-4000-8000-000000000001',
  'Admin User',
  '1990-01-01 00:00:00.000',
  'zh',
  CURRENT_TIMESTAMP(3)
);

INSERT INTO `UserNotifications` (
  `id`, `userId`, `type`, `mobile`, `communicationEmails`,
  `socialEmails`, `marketingEmails`, `securityEmails`, `updatedAt`
) VALUES (
  '00000000-0000-4000-8000-000000000041',
  '00000000-0000-4000-8000-000000000001',
  'all',
  0,
  1,
  1,
  0,
  1,
  CURRENT_TIMESTAMP(3)
);
