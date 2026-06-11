-- ================================================================
-- TaskHub — Demo Data Seed
-- ================================================================
-- Paso 1: Genera el hash bcrypt corriendo esto en la raíz de Backend:
--   node -e "require('bcrypt').hash('Demo123!',10).then(h=>console.log(h))"
-- Paso 2: Reemplaza TODAS las ocurrencias de la cadena
--         $2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu
--         con el hash real que generaste (son ~60 chars)
-- Paso 3: Ejecuta este script en la consola SQL de Neon (Run query)
-- Contraseña de todos los usuarios demo: Demo123!
-- ================================================================

-- ----------------------------------------------------------------
-- 1. USUARIOS
-- ----------------------------------------------------------------
INSERT INTO "User" (id, email, "passwordHash", "fullName", role, status, "mustChangePassword", "createdAt", "updatedAt")
VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'admin.demo@taskhub.dev',
   '$2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu',
   'Admin Sistema', 'ADMIN', 'ACTIVE', false,
   '2023-08-10 09:00:00+00', '2023-08-10 09:00:00+00'),

  ('a1000000-0000-0000-0000-000000000002',
   'patricia.morales@taskhub.dev',
   '$2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu',
   'Patricia Morales', 'PM', 'ACTIVE', false,
   '2023-08-10 09:05:00+00', '2023-08-10 09:05:00+00'),

  ('a1000000-0000-0000-0000-000000000003',
   'carlos.ramirez@taskhub.dev',
   '$2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu',
   'Carlos Ramírez', 'DEVELOPER', 'ACTIVE', false,
   '2023-08-10 09:10:00+00', '2023-08-10 09:10:00+00'),

  ('a1000000-0000-0000-0000-000000000004',
   'ana.lopez@taskhub.dev',
   '$2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu',
   'Ana López', 'DEVELOPER', 'ACTIVE', false,
   '2023-08-10 09:15:00+00', '2023-08-10 09:15:00+00'),

  ('a1000000-0000-0000-0000-000000000005',
   'miguel.torres@taskhub.dev',
   '$2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu',
   'Miguel Torres', 'DEVELOPER', 'ACTIVE', false,
   '2023-08-10 09:20:00+00', '2023-08-10 09:20:00+00'),

  ('a1000000-0000-0000-0000-000000000006',
   'sofia.herrera@taskhub.dev',
   '$2b$10$t1ISrnomCvuXMIIhJp2Is.Kj3rsIMbDG80u7J6ek3MCGiafnDpFUu',
   'Sofía Herrera', 'DEVELOPER', 'ACTIVE', false,
   '2024-08-01 09:00:00+00', '2024-08-01 09:00:00+00');

-- ----------------------------------------------------------------
-- 2. PROYECTO 1 — ARCHIVADO: Sistema de Gestión de Inventario
-- ----------------------------------------------------------------
INSERT INTO "Project" (id, name, description, code, status, "riskLevel", "createdById", "pmId",
  "startDate", "targetEndDate", "actualEndDate", budget, "createdAt", "updatedAt", "archivedAt")
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'Sistema de Gestión de Inventario',
  'Sistema interno para control de stock, movimientos de mercancía y reportes de inventario para una cadena de tiendas retail.',
  'INV-2023',
  'ARCHIVED', 'LOW',
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  '2023-10-01 00:00:00+00',
  '2023-12-01 00:00:00+00',
  '2023-12-05 00:00:00+00',
  45000.00,
  '2023-09-15 10:00:00+00',
  '2024-03-01 10:00:00+00',
  '2024-03-01 10:00:00+00'
);

-- ----------------------------------------------------------------
-- 3. PROYECTO 2 — ACTIVO: Plataforma E-Commerce TaskStore
-- ----------------------------------------------------------------
INSERT INTO "Project" (id, name, description, code, status, "riskLevel", "createdById", "pmId",
  "startDate", "targetEndDate", budget, "createdAt", "updatedAt")
VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'Plataforma E-Commerce TaskStore',
  'Desarrollo completo de plataforma de comercio electrónico con catálogo de productos, carrito de compras, pasarela de pagos, gestión de órdenes y panel de administración.',
  'ECOM-2024',
  'ACTIVE', 'HIGH',
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  '2024-09-02 00:00:00+00',
  '2025-02-28 00:00:00+00',
  180000.00,
  '2024-08-20 10:00:00+00',
  '2024-08-20 10:00:00+00'
);

-- ----------------------------------------------------------------
-- 4. MIEMBROS DE PROYECTO
-- ----------------------------------------------------------------
-- Proyecto archivado: Carlos, Ana, Miguel
INSERT INTO "ProjectMember" (id, "projectId", "userId", "joinedAt", "createdAt")
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', '2023-09-16 09:00:00+00', '2023-09-16 09:00:00+00'),
  ('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', '2023-09-16 09:00:00+00', '2023-09-16 09:00:00+00'),
  ('e1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', '2023-09-16 09:00:00+00', '2023-09-16 09:00:00+00');

-- Proyecto activo: Carlos, Ana, Miguel, Sofía
INSERT INTO "ProjectMember" (id, "projectId", "userId", "joinedAt", "createdAt")
VALUES
  ('e1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', '2024-08-21 09:00:00+00', '2024-08-21 09:00:00+00'),
  ('e1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', '2024-08-21 09:00:00+00', '2024-08-21 09:00:00+00'),
  ('e1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', '2024-08-21 09:00:00+00', '2024-08-21 09:00:00+00'),
  ('e1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', '2024-08-21 09:00:00+00', '2024-08-21 09:00:00+00');

-- ----------------------------------------------------------------
-- 5. SPRINTS — Proyecto Archivado (3 COMPLETADOS con snapshot)
-- ----------------------------------------------------------------
INSERT INTO "Sprint" (id, "projectId", name, goal, status, capacity,
  "startDate", "endDate", "completedAt",
  "snapshotTotalTickets", "snapshotCompletedTickets", "snapshotTotalSP", "snapshotCompletedSP",
  "createdAt", "updatedAt")
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Sprint 1 — Fundamentos',
    'Configurar proyecto, diseñar BD, implementar autenticación y gestión de usuarios.',
    'COMPLETED', 40,
    '2023-10-02 00:00:00+00', '2023-10-20 00:00:00+00', '2023-10-20 17:00:00+00',
    5, 5, 19, 19,
    '2023-09-28 10:00:00+00', '2023-10-20 17:00:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001',
    'Sprint 2 — Módulo de Inventario',
    'Implementar CRUD de productos, categorías, control de stock y dashboard principal.',
    'COMPLETED', 45,
    '2023-10-23 00:00:00+00', '2023-11-10 00:00:00+00', '2023-11-10 18:00:00+00',
    6, 6, 32, 32,
    '2023-10-20 17:30:00+00', '2023-11-10 18:00:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000001',
    'Sprint 3 — Reportes y Cierre',
    'Generar módulo de reportes, exportación, historial de movimientos y pruebas finales.',
    'COMPLETED', 40,
    '2023-11-13 00:00:00+00', '2023-12-01 00:00:00+00', '2023-12-01 17:30:00+00',
    5, 5, 23, 23,
    '2023-11-10 18:30:00+00', '2023-12-01 17:30:00+00'
  );

-- ----------------------------------------------------------------
-- 6. SPRINTS — Proyecto Activo (2 COMPLETADOS + 1 ACTIVO)
-- ----------------------------------------------------------------
INSERT INTO "Sprint" (id, "projectId", name, goal, status, capacity,
  "startDate", "endDate", "completedAt",
  "snapshotTotalTickets", "snapshotCompletedTickets", "snapshotTotalSP", "snapshotCompletedSP",
  "createdAt", "updatedAt")
VALUES
  (
    'c1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000002',
    'Sprint 1 — Infraestructura y Auth',
    'Establecer infraestructura base, CI/CD, modelado de datos, sistema de autenticación completo.',
    'COMPLETED', 50,
    '2024-09-02 00:00:00+00', '2024-09-20 00:00:00+00', '2024-09-20 18:00:00+00',
    10, 10, 42, 42,
    '2024-08-26 10:00:00+00', '2024-09-20 18:00:00+00'
  ),
  (
    'c1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000002',
    'Sprint 2 — Catálogo y Carrito',
    'Implementar catálogo completo de productos con búsqueda, carrito de compras persistente y gestión de inventario.',
    'COMPLETED', 55,
    '2024-09-23 00:00:00+00', '2024-10-11 00:00:00+00', '2024-10-11 17:30:00+00',
    10, 10, 53, 53,
    '2024-09-20 18:30:00+00', '2024-10-11 17:30:00+00'
  );

INSERT INTO "Sprint" (id, "projectId", name, goal, status, capacity,
  "startDate", "endDate",
  "createdAt", "updatedAt")
VALUES
  (
    'c1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000002',
    'Sprint 3 — Checkout y Pagos',
    'Desarrollar flujo completo de checkout, integración con pasarela de pagos, confirmación de órdenes y notificaciones.',
    'ACTIVE', 60,
    '2024-10-14 00:00:00+00', '2024-11-01 00:00:00+00',
    '2024-10-11 18:00:00+00', '2024-10-14 09:00:00+00'
  );

-- ----------------------------------------------------------------
-- 7. TICKETS — Proyecto Archivado
-- ----------------------------------------------------------------

-- Sprint 1 (Fundamentos) — 5 tickets, todos DONE
INSERT INTO "Ticket" (id, "projectId", "sprintId", title, description, status, priority,
  "storyPoints", "assignedToId", "createdById",
  "startDate", "dueDate", "startedAt", "completedAt",
  "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Setup inicial del repositorio y estructura del proyecto',
    'Crear repositorio Git, configurar estructura de carpetas, instalar dependencias base (Express, Prisma, dotenv) y configurar variables de entorno.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-02 00:00:00+00', '2023-10-04 00:00:00+00',
    '2023-10-02 09:00:00+00', '2023-10-03 17:00:00+00',
    8, 10,
    '2023-09-28 10:00:00+00', '2023-10-03 17:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Diseño e implementación del esquema de base de datos',
    'Modelar entidades principales (Producto, Categoría, Movimiento, Usuario) en Prisma schema. Ejecutar migraciones iniciales y seeds básicos.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-02 00:00:00+00', '2023-10-06 00:00:00+00',
    '2023-10-02 09:30:00+00', '2023-10-06 16:00:00+00',
    16, 14,
    '2023-09-28 10:05:00+00', '2023-10-06 16:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Implementar autenticación JWT con refresh tokens',
    'Crear endpoints de login/logout, generar y validar JWT, implementar refresh token con rotación y middleware de autenticación.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-04 00:00:00+00', '2023-10-10 00:00:00+00',
    '2023-10-04 09:00:00+00', '2023-10-09 18:00:00+00',
    12, 13,
    '2023-09-28 10:10:00+00', '2023-10-09 18:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'CRUD de usuarios y gestión de roles',
    'Endpoints para crear, listar, editar y desactivar usuarios. Sistema de roles (ADMIN, SUPERVISOR, OPERADOR). Guards de autorización por endpoint.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-09 00:00:00+00', '2023-10-13 00:00:00+00',
    '2023-10-09 09:00:00+00', '2023-10-12 17:00:00+00',
    10, 11,
    '2023-09-28 10:15:00+00', '2023-10-12 17:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Diseño de interfaz base y sistema de navegación',
    'Crear layout principal con sidebar, configurar React Router, diseñar componentes base (Header, Sidebar, Card, Table) y definir paleta de colores.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-02 00:00:00+00', '2023-10-08 00:00:00+00',
    '2023-10-02 09:00:00+00', '2023-10-07 17:00:00+00',
    8, 9,
    '2023-09-28 10:20:00+00', '2023-10-07 17:00:00+00'
  );

-- Sprint 2 (Módulo de Inventario) — 6 tickets, todos DONE
INSERT INTO "Ticket" (id, "projectId", "sprintId", title, description, status, priority,
  "storyPoints", "assignedToId", "createdById",
  "startDate", "dueDate", "startedAt", "completedAt",
  "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES
  (
    'd1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'CRUD completo de productos',
    'Endpoints y UI para crear, listar (con paginación), editar y eliminar productos. Validaciones de campos, carga de imagen de producto, gestión de SKU único.',
    'DONE', 'HIGH', 8,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-23 00:00:00+00', '2023-10-31 00:00:00+00',
    '2023-10-23 09:00:00+00', '2023-10-31 17:30:00+00',
    20, 22,
    '2023-10-20 18:00:00+00', '2023-10-31 17:30:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000007',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Gestión de categorías y subcategorías',
    'CRUD de categorías con árbol jerárquico de hasta 3 niveles. Asignación de categorías a productos. Filtro por categoría en el listado.',
    'DONE', 'MEDIUM', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-23 00:00:00+00', '2023-10-28 00:00:00+00',
    '2023-10-23 09:30:00+00', '2023-10-27 16:00:00+00',
    12, 10,
    '2023-10-20 18:05:00+00', '2023-10-27 16:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000008',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Control y ajuste de stock',
    'Módulo para registrar entradas y salidas de inventario. Historial de movimientos por producto. Ajustes de inventario con motivo y aprobación.',
    'DONE', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-24 00:00:00+00', '2023-11-03 00:00:00+00',
    '2023-10-24 09:00:00+00', '2023-11-03 17:00:00+00',
    18, 20,
    '2023-10-20 18:10:00+00', '2023-11-03 17:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000009',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Búsqueda avanzada y filtros de productos',
    'Implementar búsqueda full-text por nombre, SKU y descripción. Filtros combinados por categoría, rango de precio y estado de stock.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-01 00:00:00+00', '2023-11-06 00:00:00+00',
    '2023-11-01 09:00:00+00', '2023-11-05 16:00:00+00',
    8, 7,
    '2023-10-20 18:15:00+00', '2023-11-05 16:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000010',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Dashboard principal con KPIs de inventario',
    'Diseñar e implementar dashboard con: total de productos, valor de inventario, productos bajo stock mínimo, top 5 productos con más movimiento y gráfica de tendencia semanal.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2023-10-30 00:00:00+00', '2023-11-07 00:00:00+00',
    '2023-10-30 09:00:00+00', '2023-11-07 17:30:00+00',
    14, 16,
    '2023-10-20 18:20:00+00', '2023-11-07 17:30:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000011',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'Sistema de alertas de stock bajo',
    'Configurar umbrales de stock mínimo por producto. Notificaciones automáticas en el sistema cuando un producto cae por debajo del umbral. Badge de alerta en dashboard.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-06 00:00:00+00', '2023-11-10 00:00:00+00',
    '2023-11-06 09:00:00+00', '2023-11-09 17:00:00+00',
    8, 9,
    '2023-10-20 18:25:00+00', '2023-11-09 17:00:00+00'
  );

-- Sprint 3 (Reportes y Cierre) — 5 tickets, todos DONE
INSERT INTO "Ticket" (id, "projectId", "sprintId", title, description, status, priority,
  "storyPoints", "assignedToId", "createdById",
  "startDate", "dueDate", "startedAt", "completedAt",
  "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES
  (
    'd1000000-0000-0000-0000-000000000012',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'Módulo de reportes de inventario',
    'Reportes parametrizables: inventario actual por categoría, movimientos por período, productos más vendidos, diferencias de inventario. Gráficas con Chart.js.',
    'DONE', 'HIGH', 8,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-13 00:00:00+00', '2023-11-22 00:00:00+00',
    '2023-11-13 09:00:00+00', '2023-11-21 17:30:00+00',
    20, 18,
    '2023-11-10 18:30:00+00', '2023-11-21 17:30:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000013',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'Exportación de reportes a Excel y PDF',
    'Implementar descarga de cualquier reporte en formato Excel (xlsx) usando ExcelJS y PDF usando PDFKit. Incluir logo de empresa y pie de página.',
    'DONE', 'MEDIUM', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-13 00:00:00+00', '2023-11-20 00:00:00+00',
    '2023-11-13 09:00:00+00', '2023-11-20 16:00:00+00',
    12, 14,
    '2023-11-10 18:35:00+00', '2023-11-20 16:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000014',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'Historial completo de movimientos',
    'Vista con timeline de todos los movimientos de inventario (entradas, salidas, ajustes). Filtros por fecha, producto, usuario y tipo de movimiento. Paginación server-side.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-20 00:00:00+00', '2023-11-24 00:00:00+00',
    '2023-11-20 09:00:00+00', '2023-11-24 17:00:00+00',
    8, 8,
    '2023-11-10 18:40:00+00', '2023-11-24 17:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000015',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'Pruebas E2E y corrección de bugs',
    'Ejecutar suite completa de pruebas end-to-end con Playwright. Corregir los bugs encontrados. Verificar flujos críticos: login, carga de productos, ajuste de inventario y generación de reportes.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-22 00:00:00+00', '2023-11-30 00:00:00+00',
    '2023-11-22 09:00:00+00', '2023-11-30 18:00:00+00',
    16, 20,
    '2023-11-10 18:45:00+00', '2023-11-30 18:00:00+00'
  ),
  (
    'd1000000-0000-0000-0000-000000000016',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'Documentación técnica de la API',
    'Documentar todos los endpoints con Swagger/OpenAPI. Incluir ejemplos de request/response, códigos de error y guía de autenticación.',
    'DONE', 'LOW', 2,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2023-11-27 00:00:00+00', '2023-12-01 00:00:00+00',
    '2023-11-27 09:00:00+00', '2023-11-30 15:00:00+00',
    6, 5,
    '2023-11-10 18:50:00+00', '2023-11-30 15:00:00+00'
  );

-- ----------------------------------------------------------------
-- 8. TICKETS — Proyecto Activo (E-Commerce)
-- ----------------------------------------------------------------

-- Sprint 1 (Infraestructura y Auth) — 10 tickets, todos DONE
INSERT INTO "Ticket" (id, "projectId", "sprintId", title, description, status, priority,
  "storyPoints", "assignedToId", "createdById",
  "startDate", "dueDate", "startedAt", "completedAt",
  "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES
  (
    'd2000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Configuración de infraestructura y entornos',
    'Crear entornos de desarrollo, staging y producción. Configurar variables de entorno, Docker compose para desarrollo local, y conexiones a base de datos Neon (dev/prod).',
    'DONE', 'HIGH', 3,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-02 00:00:00+00', '2024-09-04 00:00:00+00',
    '2024-09-02 09:00:00+00', '2024-09-04 16:00:00+00',
    8, 10,
    '2024-08-26 10:00:00+00', '2024-09-04 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Configurar pipeline CI/CD con GitHub Actions',
    'Crear workflows para lint, tests, build y deploy automático. Separar pipelines para PR (lint+test) y merge a main (deploy a staging). Configurar secrets en GitHub.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-03 00:00:00+00', '2024-09-06 00:00:00+00',
    '2024-09-03 09:00:00+00', '2024-09-06 17:30:00+00',
    12, 15,
    '2024-08-26 10:05:00+00', '2024-09-06 17:30:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Modelado completo de base de datos',
    'Diseñar e implementar schema Prisma para todas las entidades: User, Product, Category, Cart, CartItem, Order, OrderItem, Payment, Address, Review. Ejecutar migración inicial.',
    'DONE', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-02 00:00:00+00', '2024-09-09 00:00:00+00',
    '2024-09-02 09:30:00+00', '2024-09-09 17:00:00+00',
    20, 18,
    '2024-08-26 10:10:00+00', '2024-09-09 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Servicio de autenticación con JWT y OAuth',
    'Implementar registro con validación de email, login con JWT (access + refresh tokens), logout con blacklist de tokens, Google OAuth2 y endpoint de cambio de contraseña.',
    'DONE', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-04 00:00:00+00', '2024-09-13 00:00:00+00',
    '2024-09-04 09:00:00+00', '2024-09-13 17:30:00+00',
    20, 22,
    '2024-08-26 10:15:00+00', '2024-09-13 17:30:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Gestión de sesiones y refresh token rotation',
    'Implementar estrategia de refresh token con rotación automática. Almacenar refresh tokens en Redis. Detección de token reuse attack y revocación de sesión activa.',
    'DONE', 'HIGH', 3,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-10 00:00:00+00', '2024-09-13 00:00:00+00',
    '2024-09-10 09:00:00+00', '2024-09-13 16:00:00+00',
    8, 7,
    '2024-08-26 10:20:00+00', '2024-09-13 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'API Gateway, rate limiting y middleware global',
    'Configurar middleware de CORS, helmet, rate limiting (express-rate-limit), sanitización de inputs y compresión gzip. Estandarizar formato de respuestas de la API.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-05 00:00:00+00', '2024-09-10 00:00:00+00',
    '2024-09-05 09:00:00+00', '2024-09-10 17:00:00+00',
    14, 16,
    '2024-08-26 10:25:00+00', '2024-09-10 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000007',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Sistema de logging con Winston y Sentry',
    'Configurar Winston para logging estructurado (JSON) con niveles por entorno. Integrar Sentry para error tracking en producción. Añadir request ID en cada log.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-07 00:00:00+00', '2024-09-11 00:00:00+00',
    '2024-09-07 09:00:00+00', '2024-09-10 15:00:00+00',
    8, 6,
    '2024-08-26 10:30:00+00', '2024-09-10 15:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000008',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Configuración de entornos y gestión de secrets',
    'Documentar variables de entorno requeridas, crear .env.example, configurar Doppler para manejo de secrets en staging y producción.',
    'DONE', 'LOW', 2,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-02 00:00:00+00', '2024-09-04 00:00:00+00',
    '2024-09-02 09:30:00+00', '2024-09-04 14:00:00+00',
    6, 5,
    '2024-08-26 10:35:00+00', '2024-09-04 14:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000009',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Documentación de arquitectura y ADRs',
    'Redactar documento de arquitectura del sistema, decisiones técnicas (ADRs) para elección de stack, estrategia de auth y estructura de la API. Diagrama C4 del sistema.',
    'DONE', 'LOW', 2,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-14 00:00:00+00', '2024-09-18 00:00:00+00',
    '2024-09-14 09:00:00+00', '2024-09-17 16:00:00+00',
    6, 8,
    '2024-08-26 10:40:00+00', '2024-09-17 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000010',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000004',
    'Pruebas de integración del módulo de autenticación',
    'Escribir suite de pruebas de integración con Jest y Supertest para todos los endpoints de auth. Cubrir casos: registro exitoso, email duplicado, login incorrecto, token expirado, refresh exitoso.',
    'DONE', 'HIGH', 3,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-16 00:00:00+00', '2024-09-20 00:00:00+00',
    '2024-09-16 09:00:00+00', '2024-09-19 17:00:00+00',
    8, 9,
    '2024-08-26 10:45:00+00', '2024-09-19 17:00:00+00'
  );

-- Sprint 2 (Catálogo y Carrito) — 10 tickets, todos DONE
INSERT INTO "Ticket" (id, "projectId", "sprintId", title, description, status, priority,
  "storyPoints", "assignedToId", "createdById",
  "startDate", "dueDate", "startedAt", "completedAt",
  "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES
  (
    'd2000000-0000-0000-0000-000000000011',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'CRUD completo de catálogo de productos',
    'API REST y UI para gestión del catálogo: crear producto con variantes (talla, color), editar, archivar, gestión de precios base y precio de oferta. Panel admin con tabla y filtros avanzados.',
    'DONE', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-23 00:00:00+00', '2024-10-02 00:00:00+00',
    '2024-09-23 09:00:00+00', '2024-10-02 18:30:00+00',
    20, 24,
    '2024-09-20 18:30:00+00', '2024-10-02 18:30:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000012',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Gestión de categorías con árbol jerárquico',
    'Implementar categorías con jerarquía (Electrónica > Smartphones > Android). CRUD en panel admin, asignación de categoría principal y secundarias a productos, breadcrumb en UI.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-23 00:00:00+00', '2024-09-27 00:00:00+00',
    '2024-09-23 09:30:00+00', '2024-09-27 15:00:00+00',
    12, 11,
    '2024-09-20 18:35:00+00', '2024-09-27 15:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000013',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Motor de búsqueda y filtros de productos',
    'Búsqueda full-text por nombre y descripción con PostgreSQL tsvector. Filtros por categoría, rango de precio, rating, disponibilidad y marca. Ordenamiento por precio, relevancia y novedad.',
    'DONE', 'HIGH', 8,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-24 00:00:00+00', '2024-10-03 00:00:00+00',
    '2024-09-24 09:00:00+00', '2024-10-02 17:00:00+00',
    20, 18,
    '2024-09-20 18:40:00+00', '2024-10-02 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000014',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Servicio de carga y optimización de imágenes',
    'Integrar Cloudinary para upload de imágenes de productos. Redimensionamiento automático a múltiples resoluciones (thumbnail, medium, large). Máximo 8 imágenes por producto con ordenamiento drag-and-drop.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-26 00:00:00+00', '2024-10-02 00:00:00+00',
    '2024-09-26 09:00:00+00', '2024-10-03 17:00:00+00',
    14, 18,
    '2024-09-20 18:45:00+00', '2024-10-03 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000015',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Carrito de compras con sesión y usuario',
    'Implementar carrito funcional: añadir/remover productos, cambiar cantidad, cálculo de subtotal. Carrito persistente para usuarios autenticados (DB) y anónimos (localStorage). Merge al hacer login.',
    'DONE', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-25 00:00:00+00', '2024-10-04 00:00:00+00',
    '2024-09-25 09:00:00+00', '2024-10-04 17:30:00+00',
    20, 20,
    '2024-09-20 18:50:00+00', '2024-10-04 17:30:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000016',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Persistencia y sincronización del carrito',
    'Asegurar que el carrito se sincroniza en tiempo real entre pestañas usando localStorage events. Manejar concurrencia cuando el mismo usuario tiene múltiples tabs abiertas.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-04 00:00:00+00', '2024-10-07 00:00:00+00',
    '2024-10-04 09:00:00+00', '2024-10-07 16:00:00+00',
    8, 9,
    '2024-09-20 18:55:00+00', '2024-10-07 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000017',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Página de detalle de producto',
    'UI de detalle de producto: galería de imágenes con zoom, selector de variantes (talla/color), stock disponible por variante, descripción enriquecida, productos relacionados y sección de reseñas.',
    'DONE', 'HIGH', 3,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-01 00:00:00+00', '2024-10-06 00:00:00+00',
    '2024-10-01 09:00:00+00', '2024-10-05 16:00:00+00',
    8, 7,
    '2024-09-20 19:00:00+00', '2024-10-05 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000018',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Sistema de gestión de inventario por variante',
    'Control de stock a nivel de variante (talla + color). Reserva temporal de stock al añadir al carrito (15 min timeout). Actualización automática al confirmar o cancelar orden.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-09-30 00:00:00+00', '2024-10-07 00:00:00+00',
    '2024-09-30 09:00:00+00', '2024-10-06 17:00:00+00',
    14, 13,
    '2024-09-20 19:05:00+00', '2024-10-06 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000019',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Motor de precios y reglas de pricing',
    'Sistema flexible de precios: precio base, precio de oferta con fechas de vigencia, precios por volumen. Cálculo automático del descuento porcentual en la UI.',
    'DONE', 'MEDIUM', 3,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-07 00:00:00+00', '2024-10-10 00:00:00+00',
    '2024-10-07 09:00:00+00', '2024-10-10 14:00:00+00',
    8, 8,
    '2024-09-20 19:10:00+00', '2024-10-10 14:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000020',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000005',
    'Sistema de cupones y descuentos',
    'Crear y gestionar cupones (porcentaje, monto fijo, envío gratis). Validaciones: fecha de expiración, uso máximo, monto mínimo de compra, categorías aplicables. Aplicación en el carrito.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-05 00:00:00+00', '2024-10-11 00:00:00+00',
    '2024-10-05 09:00:00+00', '2024-10-11 17:00:00+00',
    12, 16,
    '2024-09-20 19:15:00+00', '2024-10-11 17:00:00+00'
  );

-- Sprint 3 (Checkout y Pagos, ACTIVO) — 12 tickets, estado mixto
INSERT INTO "Ticket" (id, "projectId", "sprintId", title, description, status, priority,
  "storyPoints", "assignedToId", "createdById",
  "startDate", "dueDate", "startedAt", "completedAt",
  "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES
  -- 4 DONE
  (
    'd2000000-0000-0000-0000-000000000021',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Flujo de checkout — paso 1: dirección de envío',
    'Implementar paso 1 del checkout: seleccionar dirección guardada o ingresar nueva. Validación de campos, geocodificación de dirección con Google Maps API, selector de método de entrega.',
    'DONE', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-14 00:00:00+00', '2024-10-18 00:00:00+00',
    '2024-10-14 09:00:00+00', '2024-10-18 17:00:00+00',
    12, 14,
    '2024-10-11 18:00:00+00', '2024-10-18 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000022',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Integración con pasarela de pagos — Setup y sandbox',
    'Crear cuenta en Stripe, configurar webhooks, implementar cliente SDK, configurar modo sandbox para pruebas. Definir flujo de pago con Payment Intents API. Manejar eventos críticos del webhook.',
    'DONE', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-14 00:00:00+00', '2024-10-20 00:00:00+00',
    '2024-10-14 09:00:00+00', '2024-10-21 17:30:00+00',
    20, 22,
    '2024-10-11 18:05:00+00', '2024-10-21 17:30:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000023',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Modelo de órdenes y ciclo de vida',
    'Crear modelo Order con estados (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED). Endpoints para crear orden desde carrito, consultar y cancelar. Historial de cambios de estado.',
    'DONE', 'CRITICAL', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-15 00:00:00+00', '2024-10-21 00:00:00+00',
    '2024-10-15 09:00:00+00', '2024-10-20 16:00:00+00',
    14, 12,
    '2024-10-11 18:10:00+00', '2024-10-20 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000024',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Servicio de notificaciones por email transaccional',
    'Integrar SendGrid para emails transaccionales. Templates para: confirmación de cuenta, reseteo de contraseña, confirmación de orden, cambios de estado de orden y notificación de envío con número de tracking.',
    'DONE', 'HIGH', 3,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-16 00:00:00+00', '2024-10-21 00:00:00+00',
    '2024-10-16 09:00:00+00', '2024-10-21 15:00:00+00',
    8, 9,
    '2024-10-11 18:15:00+00', '2024-10-21 15:00:00+00'
  ),

  -- 3 IN_PROGRESS
  (
    'd2000000-0000-0000-0000-000000000025',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Procesamiento de pagos con Stripe y manejo de errores',
    'Implementar flujo completo de cobro: crear PaymentIntent, confirmar pago en frontend, manejar 3D Secure, gestionar errores de tarjeta (fondos insuficientes, tarjeta rechazada, expirada). Página de éxito/fallo.',
    'IN_PROGRESS', 'CRITICAL', 8,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-21 00:00:00+00', '2024-10-28 00:00:00+00',
    '2024-10-21 09:00:00+00', NULL,
    20, 12,
    '2024-10-11 18:20:00+00', '2024-10-25 17:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000026',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Página de confirmación de orden y recibo digital',
    'UI de confirmación post-pago: resumen de la orden, items comprados, total pagado, dirección de entrega y tiempo estimado. Generación de recibo PDF descargable con número de orden único.',
    'IN_PROGRESS', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-22 00:00:00+00', '2024-10-28 00:00:00+00',
    '2024-10-22 09:00:00+00', NULL,
    12, NULL,
    '2024-10-11 18:25:00+00', '2024-10-25 10:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000027',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Calculadora de costos de envío por zona',
    'Implementar cálculo dinámico de costos de envío basado en peso del paquete, zona geográfica y método de envío (estándar, express, mismo día). Integración con tabla de tarifas por código postal.',
    'IN_PROGRESS', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-22 00:00:00+00', '2024-10-28 00:00:00+00',
    '2024-10-22 09:30:00+00', NULL,
    14, NULL,
    '2024-10-11 18:30:00+00', '2024-10-24 11:00:00+00'
  ),

  -- 2 IN_REVIEW
  (
    'd2000000-0000-0000-0000-000000000028',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Auditoría de seguridad del módulo de pagos',
    'Revisar y corregir vulnerabilidades en el flujo de pagos: validar que los montos no puedan manipularse desde el cliente, verificar firmas de webhooks de Stripe, auditar manejo de datos de tarjeta (PCI DSS).',
    'IN_REVIEW', 'CRITICAL', 5,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-23 00:00:00+00', '2024-10-29 00:00:00+00',
    '2024-10-23 09:00:00+00', NULL,
    16, NULL,
    '2024-10-11 18:35:00+00', '2024-10-26 16:00:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000029',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Optimización de performance — lazy loading y caché',
    'Implementar lazy loading de imágenes y componentes React. Configurar caché de respuestas API con Redis (TTL 5 min para catálogo). Optimizar queries N+1 detectados con Prisma. Lighthouse score > 90.',
    'IN_REVIEW', 'HIGH', 3,
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-24 00:00:00+00', '2024-10-29 00:00:00+00',
    '2024-10-24 09:00:00+00', NULL,
    8, NULL,
    '2024-10-11 18:40:00+00', '2024-10-27 14:00:00+00'
  ),

  -- 2 TODO
  (
    'd2000000-0000-0000-0000-000000000030',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Panel de administración — gestión de órdenes',
    'Dashboard para administradores: listado de órdenes con filtros (estado, fecha, cliente), detalle de orden, cambio manual de estado, opción de reembolso parcial/total y exportación a CSV.',
    'TODO', 'HIGH', 8,
    'a1000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-28 00:00:00+00', '2024-11-01 00:00:00+00',
    NULL, NULL,
    20, NULL,
    '2024-10-11 18:45:00+00', '2024-10-11 18:45:00+00'
  ),
  (
    'd2000000-0000-0000-0000-000000000031',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Analytics y reportes de ventas',
    'Dashboard de analytics con: ventas por período (diario/semanal/mensual), productos más vendidos, tasa de conversión del carrito, ticket promedio y mapa de calor de regiones con más ventas.',
    'TODO', 'MEDIUM', 8,
    'a1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-28 00:00:00+00', '2024-11-01 00:00:00+00',
    NULL, NULL,
    20, NULL,
    '2024-10-11 18:50:00+00', '2024-10-11 18:50:00+00'
  ),

  -- 1 BLOCKED
  (
    'd2000000-0000-0000-0000-000000000032',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000006',
    'Integración con API de paquetería para tracking',
    'Conectar con API de FedEx/DHL para: cotización de envío en tiempo real, creación de guías automáticas al confirmar orden y webhook de actualizaciones de tracking. BLOQUEADO: esperando credenciales API del proveedor de logística.',
    'BLOCKED', 'HIGH', 5,
    'a1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000002',
    '2024-10-22 00:00:00+00', '2024-10-30 00:00:00+00',
    NULL, NULL,
    14, NULL,
    '2024-10-11 18:55:00+00', '2024-10-22 10:00:00+00'
  );

-- ----------------------------------------------------------------
-- 9. GAMIFICATION EVENTS — Tickets DONE del proyecto activo
-- ----------------------------------------------------------------
-- Sprint 1 (10 tickets DONE): d2...001 a d2...010
-- Sprint 2 (10 tickets DONE): d2...011 a d2...020
-- Sprint 3 (4 tickets DONE):  d2...021 a d2...024
INSERT INTO "GamificationEvent" (id, "ticketId", "userId", "projectId", points, priority,
  "storyPoints", "estimatedHours", "actualHours", precision, "createdAt")
VALUES
  -- Sprint 1
  ('f2000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 40, 'HIGH',   3, 8,  10, false, '2024-09-04 17:00:00+00'),
  ('f2000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 38, 'HIGH',   5, 12, 15, false, '2024-09-06 18:30:00+00'),
  ('f2000000-0000-0000-0000-000000000003', 'd2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 75, 'CRITICAL',8, 20, 18, true,  '2024-09-09 17:30:00+00'),
  ('f2000000-0000-0000-0000-000000000004', 'd2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 70, 'CRITICAL',8, 20, 22, false, '2024-09-13 18:00:00+00'),
  ('f2000000-0000-0000-0000-000000000005', 'd2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 55, 'HIGH',   3, 8,  7,  true,  '2024-09-13 16:30:00+00'),
  ('f2000000-0000-0000-0000-000000000006', 'd2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 45, 'HIGH',   5, 14, 16, false, '2024-09-10 17:30:00+00'),
  ('f2000000-0000-0000-0000-000000000007', 'd2000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 50, 'MEDIUM', 3, 8,  6,  true,  '2024-09-10 15:30:00+00'),
  ('f2000000-0000-0000-0000-000000000008', 'd2000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 30, 'LOW',    2, 6,  5,  true,  '2024-09-04 14:30:00+00'),
  ('f2000000-0000-0000-0000-000000000009', 'd2000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 25, 'LOW',    2, 6,  8,  false, '2024-09-17 16:30:00+00'),
  ('f2000000-0000-0000-0000-000000000010', 'd2000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 45, 'HIGH',   3, 8,  9,  false, '2024-09-19 17:30:00+00'),
  -- Sprint 2
  ('f2000000-0000-0000-0000-000000000011', 'd2000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 65, 'CRITICAL',8, 20, 24, false, '2024-10-02 19:00:00+00'),
  ('f2000000-0000-0000-0000-000000000012', 'd2000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 60, 'HIGH',   5, 12, 11, true,  '2024-09-27 15:30:00+00'),
  ('f2000000-0000-0000-0000-000000000013', 'd2000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 75, 'HIGH',   8, 20, 18, true,  '2024-10-02 17:30:00+00'),
  ('f2000000-0000-0000-0000-000000000014', 'd2000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 45, 'HIGH',   5, 14, 18, false, '2024-10-03 17:30:00+00'),
  ('f2000000-0000-0000-0000-000000000015', 'd2000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 80, 'CRITICAL',8, 20, 20, true,  '2024-10-04 18:00:00+00'),
  ('f2000000-0000-0000-0000-000000000016', 'd2000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 40, 'MEDIUM', 3, 8,  9,  false, '2024-10-07 16:30:00+00'),
  ('f2000000-0000-0000-0000-000000000017', 'd2000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 55, 'HIGH',   3, 8,  7,  true,  '2024-10-05 16:30:00+00'),
  ('f2000000-0000-0000-0000-000000000018', 'd2000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 60, 'HIGH',   5, 14, 13, true,  '2024-10-06 17:30:00+00'),
  ('f2000000-0000-0000-0000-000000000019', 'd2000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 40, 'MEDIUM', 3, 8,  8,  true,  '2024-10-10 14:30:00+00'),
  ('f2000000-0000-0000-0000-000000000020', 'd2000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 48, 'HIGH',   5, 12, 16, false, '2024-10-11 17:30:00+00'),
  -- Sprint 3 (solo los 4 DONE)
  ('f2000000-0000-0000-0000-000000000021', 'd2000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 48, 'HIGH',   5, 12, 14, false, '2024-10-18 17:30:00+00'),
  ('f2000000-0000-0000-0000-000000000022', 'd2000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 70, 'CRITICAL',8, 20, 22, false, '2024-10-21 18:00:00+00'),
  ('f2000000-0000-0000-0000-000000000023', 'd2000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 72, 'CRITICAL',5, 14, 12, true,  '2024-10-20 16:30:00+00'),
  ('f2000000-0000-0000-0000-000000000024', 'd2000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 55, 'HIGH',   3, 8,  9,  false, '2024-10-21 15:30:00+00');

-- ================================================================
-- FIN DEL SEED
-- Usuarios creados (contraseña: Demo123!):
--   admin.demo@taskhub.dev        → ADMIN
--   patricia.morales@taskhub.dev  → PM
--   carlos.ramirez@taskhub.dev    → DEVELOPER
--   ana.lopez@taskhub.dev         → DEVELOPER
--   miguel.torres@taskhub.dev     → DEVELOPER
--   sofia.herrera@taskhub.dev     → DEVELOPER
--
-- Proyectos:
--   INV-2023  → Sistema de Gestión de Inventario (ARCHIVADO)
--              3 sprints COMPLETADOS | 16 tickets | 74 SP
--   ECOM-2024 → Plataforma E-Commerce TaskStore (ACTIVO, riesgo HIGH)
--              2 sprints COMPLETADOS + 1 ACTIVO | 32 tickets | 137 SP
--              Sprint activo: 4 DONE, 3 IN_PROGRESS, 2 IN_REVIEW, 2 TODO, 1 BLOCKED
-- ================================================================
