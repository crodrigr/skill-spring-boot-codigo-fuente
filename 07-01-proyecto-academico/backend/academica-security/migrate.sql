-- migrate.sql: carga datos de ejemplo en la base `academia` de la API con Spring Security.
--   · 2 cuentas para autenticar:  admin / admin123 (ADMIN)  y  ana / ana123 (USER)
--     (las contraseñas se guardan como hash BCrypt; el login recibe el texto plano)
--   · 100 estudiantes, 20 cursos y 30 matrículas (el curso «Estructuras de Datos» queda LLENO: cupo 3)
--
-- Uso automático: la aplicación lo ejecuta en cada arranque (spring.sql.init.data-locations en application.properties),
--    justo después de que Hibernate recrea las tablas (ddl-auto=create las borra y vuelve a crear).
-- Uso manual:  mysql -uroot -proot < migrate.sql      (o desde MySQL Workbench; si ddl-auto=create, hazlo con la app ya arrancada)
-- Es repetible: no duplica cuentas, estudiantes (por correo), cursos (por nombre) ni matrículas.
-- SOLO PARA FINES EDUCATIVOS: en un proyecto real no se siembran cuentas con contraseñas conocidas.

CREATE DATABASE IF NOT EXISTS academia;
USE academia;

-- Tablas (idénticas a las que genera Hibernate; no hacen nada si ya existen)
CREATE TABLE IF NOT EXISTS user_account (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  username      VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('ADMIN','USER') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_account_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NULL,
  age        INT          NOT NULL,
  email      VARCHAR(255) NULL,
  created_at DATETIME(6)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_student_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  name         VARCHAR(255) NULL,
  price        DOUBLE       NOT NULL,
  max_capacity INT          NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollment (
  id         BIGINT NOT NULL AUTO_INCREMENT,
  student_id BIGINT NULL,
  course_id  BIGINT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES student (id),
  CONSTRAINT fk_enrollment_course  FOREIGN KEY (course_id)  REFERENCES course (id)
) ENGINE=InnoDB;

-- Cuentas para autenticar (INSERT IGNORE: si el usuario ya existe, no se toca)
INSERT IGNORE INTO user_account (username, password_hash, role) VALUES
  ('admin', '$2a$10$RpzcdCeYb3qhImwhXg6PR.a2CyavpcEuqWqtyA95XU8HIuOf0Nwea', 'ADMIN'),
  ('ana',   '$2a$10$JGHYQBTzWz2g7JbSqPcao.Y1Luu72HfK.rTP23UCykhErENyMCJOC', 'USER');

-- Estudiantes (100; el correo es único: si ya existe, se omite)
INSERT IGNORE INTO student (name, age, email, created_at) VALUES
  ('Ana García Rodríguez', 38, 'ana.garcia1@academy.com', NOW()),
  ('Luis Martínez Torres', 41, 'luis.martinez2@academy.com', NOW()),
  ('Carlos Sánchez Pérez', 25, 'carlos.sanchez3@academy.com', NOW()),
  ('María Flores López', 21, 'maria.flores4@academy.com', NOW()),
  ('José López Flores', 35, 'jose.lopez5@academy.com', NOW()),
  ('Laura Pérez Sánchez', 31, 'laura.perez6@academy.com', NOW()),
  ('Pedro Torres Martínez', 20, 'pedro.torres7@academy.com', NOW()),
  ('Sofía Rodríguez García', 34, 'sofia.rodriguez8@academy.com', NOW()),
  ('Miguel González Ramírez', 35, 'miguel.gonzalez9@academy.com', NOW()),
  ('Lucía Ramírez González', 38, 'lucia.ramirez10@academy.com', NOW()),
  ('Javier García Rodríguez', 31, 'javier.garcia11@academy.com', NOW()),
  ('Elena Martínez Torres', 36, 'elena.martinez12@academy.com', NOW()),
  ('Diego Sánchez Pérez', 45, 'diego.sanchez13@academy.com', NOW()),
  ('Carmen Flores López', 43, 'carmen.flores14@academy.com', NOW()),
  ('Andrés López Flores', 31, 'andres.lopez15@academy.com', NOW()),
  ('Paula Pérez Sánchez', 22, 'paula.perez16@academy.com', NOW()),
  ('Jorge Torres Martínez', 42, 'jorge.torres17@academy.com', NOW()),
  ('Marta Rodríguez García', 20, 'marta.rodriguez18@academy.com', NOW()),
  ('Raúl González Ramírez', 29, 'raul.gonzalez19@academy.com', NOW()),
  ('Isabel Ramírez González', 37, 'isabel.ramirez20@academy.com', NOW()),
  ('Ana Rodríguez Rodríguez', 19, 'ana.rodriguez21@academy.com', NOW()),
  ('Luis González Torres', 35, 'luis.gonzalez22@academy.com', NOW()),
  ('Carlos Ramírez Pérez', 30, 'carlos.ramirez23@academy.com', NOW()),
  ('María García López', 27, 'maria.garcia24@academy.com', NOW()),
  ('José Martínez Flores', 37, 'jose.martinez25@academy.com', NOW()),
  ('Laura Sánchez Sánchez', 29, 'laura.sanchez26@academy.com', NOW()),
  ('Pedro Flores Martínez', 40, 'pedro.flores27@academy.com', NOW()),
  ('Sofía López García', 39, 'sofia.lopez28@academy.com', NOW()),
  ('Miguel Pérez Ramírez', 27, 'miguel.perez29@academy.com', NOW()),
  ('Lucía Torres González', 45, 'lucia.torres30@academy.com', NOW()),
  ('Javier Rodríguez Rodríguez', 21, 'javier.rodriguez31@academy.com', NOW()),
  ('Elena González Torres', 32, 'elena.gonzalez32@academy.com', NOW()),
  ('Diego Ramírez Pérez', 29, 'diego.ramirez33@academy.com', NOW()),
  ('Carmen García López', 29, 'carmen.garcia34@academy.com', NOW()),
  ('Andrés Martínez Flores', 26, 'andres.martinez35@academy.com', NOW()),
  ('Paula Sánchez Sánchez', 39, 'paula.sanchez36@academy.com', NOW()),
  ('Jorge Flores Martínez', 37, 'jorge.flores37@academy.com', NOW()),
  ('Marta López García', 35, 'marta.lopez38@academy.com', NOW()),
  ('Raúl Pérez Ramírez', 23, 'raul.perez39@academy.com', NOW()),
  ('Isabel Torres González', 26, 'isabel.torres40@academy.com', NOW()),
  ('Ana López Rodríguez', 38, 'ana.lopez41@academy.com', NOW()),
  ('Luis Pérez Torres', 25, 'luis.perez42@academy.com', NOW()),
  ('Carlos Torres Pérez', 44, 'carlos.torres43@academy.com', NOW()),
  ('María Rodríguez López', 19, 'maria.rodriguez44@academy.com', NOW()),
  ('José González Flores', 19, 'jose.gonzalez45@academy.com', NOW()),
  ('Laura Ramírez Sánchez', 30, 'laura.ramirez46@academy.com', NOW()),
  ('Pedro García Martínez', 24, 'pedro.garcia47@academy.com', NOW()),
  ('Sofía Martínez García', 36, 'sofia.martinez48@academy.com', NOW()),
  ('Miguel Sánchez Ramírez', 28, 'miguel.sanchez49@academy.com', NOW()),
  ('Lucía Flores González', 33, 'lucia.flores50@academy.com', NOW()),
  ('Javier López Rodríguez', 38, 'javier.lopez51@academy.com', NOW()),
  ('Elena Pérez Torres', 26, 'elena.perez52@academy.com', NOW()),
  ('Diego Torres Pérez', 41, 'diego.torres53@academy.com', NOW()),
  ('Carmen Rodríguez López', 26, 'carmen.rodriguez54@academy.com', NOW()),
  ('Andrés González Flores', 31, 'andres.gonzalez55@academy.com', NOW()),
  ('Paula Ramírez Sánchez', 30, 'paula.ramirez56@academy.com', NOW()),
  ('Jorge García Martínez', 22, 'jorge.garcia57@academy.com', NOW()),
  ('Marta Martínez García', 20, 'marta.martinez58@academy.com', NOW()),
  ('Raúl Sánchez Ramírez', 45, 'raul.sanchez59@academy.com', NOW()),
  ('Isabel Flores González', 38, 'isabel.flores60@academy.com', NOW()),
  ('Ana Martínez Rodríguez', 39, 'ana.martinez61@academy.com', NOW()),
  ('Luis Sánchez Torres', 20, 'luis.sanchez62@academy.com', NOW()),
  ('Carlos Flores Pérez', 37, 'carlos.flores63@academy.com', NOW()),
  ('María López López', 34, 'maria.lopez64@academy.com', NOW()),
  ('José Pérez Flores', 35, 'jose.perez65@academy.com', NOW()),
  ('Laura Torres Sánchez', 18, 'laura.torres66@academy.com', NOW()),
  ('Pedro Rodríguez Martínez', 21, 'pedro.rodriguez67@academy.com', NOW()),
  ('Sofía González García', 35, 'sofia.gonzalez68@academy.com', NOW()),
  ('Miguel Ramírez Ramírez', 42, 'miguel.ramirez69@academy.com', NOW()),
  ('Lucía García González', 21, 'lucia.garcia70@academy.com', NOW()),
  ('Javier Martínez Rodríguez', 23, 'javier.martinez71@academy.com', NOW()),
  ('Elena Sánchez Torres', 41, 'elena.sanchez72@academy.com', NOW()),
  ('Diego Flores Pérez', 26, 'diego.flores73@academy.com', NOW()),
  ('Carmen López López', 42, 'carmen.lopez74@academy.com', NOW()),
  ('Andrés Pérez Flores', 21, 'andres.perez75@academy.com', NOW()),
  ('Paula Torres Sánchez', 27, 'paula.torres76@academy.com', NOW()),
  ('Jorge Rodríguez Martínez', 34, 'jorge.rodriguez77@academy.com', NOW()),
  ('Marta González García', 22, 'marta.gonzalez78@academy.com', NOW()),
  ('Raúl Ramírez Ramírez', 23, 'raul.ramirez79@academy.com', NOW()),
  ('Isabel García González', 42, 'isabel.garcia80@academy.com', NOW()),
  ('Ana González Rodríguez', 18, 'ana.gonzalez81@academy.com', NOW()),
  ('Luis Ramírez Torres', 33, 'luis.ramirez82@academy.com', NOW()),
  ('Carlos García Pérez', 29, 'carlos.garcia83@academy.com', NOW()),
  ('María Martínez López', 44, 'maria.martinez84@academy.com', NOW()),
  ('José Sánchez Flores', 25, 'jose.sanchez85@academy.com', NOW()),
  ('Laura Flores Sánchez', 36, 'laura.flores86@academy.com', NOW()),
  ('Pedro López Martínez', 20, 'pedro.lopez87@academy.com', NOW()),
  ('Sofía Pérez García', 44, 'sofia.perez88@academy.com', NOW()),
  ('Miguel Torres Ramírez', 42, 'miguel.torres89@academy.com', NOW()),
  ('Lucía Rodríguez González', 22, 'lucia.rodriguez90@academy.com', NOW()),
  ('Javier González Rodríguez', 33, 'javier.gonzalez91@academy.com', NOW()),
  ('Elena Ramírez Torres', 23, 'elena.ramirez92@academy.com', NOW()),
  ('Diego García Pérez', 45, 'diego.garcia93@academy.com', NOW()),
  ('Carmen Martínez López', 24, 'carmen.martinez94@academy.com', NOW()),
  ('Andrés Sánchez Flores', 42, 'andres.sanchez95@academy.com', NOW()),
  ('Paula Flores Sánchez', 24, 'paula.flores96@academy.com', NOW()),
  ('Jorge López Martínez', 30, 'jorge.lopez97@academy.com', NOW()),
  ('Marta Pérez García', 38, 'marta.perez98@academy.com', NOW()),
  ('Raúl Torres Ramírez', 34, 'raul.torres99@academy.com', NOW()),
  ('Isabel Rodríguez González', 25, 'isabel.rodriguez100@academy.com', NOW());

-- Cursos (20; solo si no existe uno con ese nombre)
INSERT INTO course (name, price, max_capacity)
SELECT 'Introducción a Java', 150000, 30 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Introducción a Java');

INSERT INTO course (name, price, max_capacity)
SELECT 'Programación Orientada a Objetos', 180000, 30 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Programación Orientada a Objetos');

INSERT INTO course (name, price, max_capacity)
SELECT 'Spring Boot Básico', 250000, 25 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Spring Boot Básico');

INSERT INTO course (name, price, max_capacity)
SELECT 'Spring Data JPA', 220000, 25 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Spring Data JPA');

INSERT INTO course (name, price, max_capacity)
SELECT 'API REST', 200000, 25 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'API REST');

INSERT INTO course (name, price, max_capacity)
SELECT 'Documentación con Swagger', 120000, 20 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Documentación con Swagger');

INSERT INTO course (name, price, max_capacity)
SELECT 'Bases de Datos SQL', 160000, 30 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Bases de Datos SQL');

INSERT INTO course (name, price, max_capacity)
SELECT 'MySQL Avanzado', 190000, 25 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'MySQL Avanzado');

INSERT INTO course (name, price, max_capacity)
SELECT 'Git y GitHub', 90000, 40 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Git y GitHub');

INSERT INTO course (name, price, max_capacity)
SELECT 'Docker para Desarrolladores', 180000, 20 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Docker para Desarrolladores');

INSERT INTO course (name, price, max_capacity)
SELECT 'Pruebas Unitarias con JUnit', 140000, 25 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Pruebas Unitarias con JUnit');

INSERT INTO course (name, price, max_capacity)
SELECT 'Seguridad con Spring Security', 260000, 20 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Seguridad con Spring Security');

INSERT INTO course (name, price, max_capacity)
SELECT 'Microservicios', 300000, 15 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Microservicios');

INSERT INTO course (name, price, max_capacity)
SELECT 'Estructuras de Datos', 170000, 3 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Estructuras de Datos');

INSERT INTO course (name, price, max_capacity)
SELECT 'Algoritmos', 170000, 20 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Algoritmos');

INSERT INTO course (name, price, max_capacity)
SELECT 'HTML y CSS', 100000, 40 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'HTML y CSS');

INSERT INTO course (name, price, max_capacity)
SELECT 'JavaScript', 130000, 35 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'JavaScript');

INSERT INTO course (name, price, max_capacity)
SELECT 'Angular', 210000, 25 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Angular');

INSERT INTO course (name, price, max_capacity)
SELECT 'Patrones de Diseño', 150000, 20 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'Patrones de Diseño');

INSERT INTO course (name, price, max_capacity)
SELECT 'DevOps y CI/CD', 240000, 15 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM course WHERE name = 'DevOps y CI/CD');

-- Matrículas (30; solo si esa pareja estudiante-curso no existe)
INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'jose.lopez5@academy.com' AND c.name = 'Pruebas Unitarias con JUnit'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'sofia.rodriguez8@academy.com' AND c.name = 'Microservicios'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'lucia.ramirez10@academy.com' AND c.name = 'Programación Orientada a Objetos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'lucia.ramirez10@academy.com' AND c.name = 'Algoritmos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'lucia.ramirez10@academy.com' AND c.name = 'JavaScript'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'diego.sanchez13@academy.com' AND c.name = 'Spring Data JPA'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'carmen.flores14@academy.com' AND c.name = 'MySQL Avanzado'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'jorge.torres17@academy.com' AND c.name = 'Patrones de Diseño'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'marta.rodriguez18@academy.com' AND c.name = 'Estructuras de Datos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'maria.garcia24@academy.com' AND c.name = 'Git y GitHub'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'jose.martinez25@academy.com' AND c.name = 'Bases de Datos SQL'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'sofia.lopez28@academy.com' AND c.name = 'Angular'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'miguel.perez29@academy.com' AND c.name = 'Introducción a Java'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'lucia.torres30@academy.com' AND c.name = 'Spring Boot Básico'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'lucia.torres30@academy.com' AND c.name = 'Patrones de Diseño'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'javier.rodriguez31@academy.com' AND c.name = 'Git y GitHub'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'elena.gonzalez32@academy.com' AND c.name = 'HTML y CSS'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'maria.rodriguez44@academy.com' AND c.name = 'Introducción a Java'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'laura.ramirez46@academy.com' AND c.name = 'Estructuras de Datos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'diego.torres53@academy.com' AND c.name = 'Bases de Datos SQL'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'diego.torres53@academy.com' AND c.name = 'Algoritmos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'isabel.flores60@academy.com' AND c.name = 'MySQL Avanzado'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'miguel.ramirez69@academy.com' AND c.name = 'Algoritmos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'carmen.lopez74@academy.com' AND c.name = 'HTML y CSS'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'paula.torres76@academy.com' AND c.name = 'Angular'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'jose.sanchez85@academy.com' AND c.name = 'Estructuras de Datos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'laura.flores86@academy.com' AND c.name = 'HTML y CSS'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'pedro.lopez87@academy.com' AND c.name = 'Spring Data JPA'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'carmen.martinez94@academy.com' AND c.name = 'Programación Orientada a Objetos'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

INSERT INTO enrollment (student_id, course_id)
SELECT s.id, c.id FROM student s, course c
WHERE s.email = 'carmen.martinez94@academy.com' AND c.name = 'Pruebas Unitarias con JUnit'
  AND NOT EXISTS (SELECT 1 FROM enrollment x WHERE x.student_id = s.id AND x.course_id = c.id);

-- Comprobación rápida
SELECT username, role, LEFT(password_hash, 7) AS hash_prefix FROM user_account;
SELECT (SELECT COUNT(*) FROM student) AS estudiantes, (SELECT COUNT(*) FROM course) AS cursos, (SELECT COUNT(*) FROM enrollment) AS matriculas;
