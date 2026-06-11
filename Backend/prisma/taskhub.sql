-- TASKHUB DATABASE SCRIPT

-- =============================================================================
-- TIPOS ENUM
-- =============================================================================

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PM', 'DEVELOPER', 'VIEWER');
CREATE TYPE "OtpType" AS ENUM ('ACCOUNT_SETUP');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_SETUP');
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "SprintStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TicketStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED');
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');


-- =============================================================================
-- CREACIÓN DE TABLAS
-- =============================================================================

-- Tabla: User
CREATE TABLE "User" (
    "id"                 UUID         NOT NULL DEFAULT gen_random_uuid(),
    "email"              TEXT         NOT NULL,
    "passwordHash"       TEXT         NOT NULL,
    "fullName"           TEXT         NOT NULL,
    "avatarUrl"          TEXT,
    "role"               "UserRole"   NOT NULL DEFAULT 'DEVELOPER',
    "status"             "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "mustChangePassword" BOOLEAN      NOT NULL DEFAULT TRUE,
    "lastLoginAt"        TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"          TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


-- Tabla: UserOtp
CREATE TABLE "UserOtp" (
    "id"        UUID        NOT NULL DEFAULT gen_random_uuid(),
    "userId"    UUID        NOT NULL,
    "type"      "OtpType"   NOT NULL,
    "codeHash"  TEXT        NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOtp_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserOtp_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "UserOtp_userId_type_idx" ON "UserOtp"("userId", "type");
CREATE INDEX "UserOtp_expiresAt_idx" ON "UserOtp"("expiresAt");


-- Tabla: Project
CREATE TABLE "Project" (
    "id"            UUID            NOT NULL DEFAULT gen_random_uuid(),
    "name"          TEXT            NOT NULL,
    "description"   TEXT,
    "code"          TEXT            NOT NULL,
    "status"        "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "riskLevel"     "RiskLevel"     NOT NULL DEFAULT 'LOW',
    "createdById"   UUID            NOT NULL,
    "pmId"          UUID,
    "startDate"     TIMESTAMP(3)    NOT NULL,
    "targetEndDate" TIMESTAMP(3)    NOT NULL,
    "actualEndDate" TIMESTAMP(3),
    "budget"        DOUBLE PRECISION,
    "createdAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt"    TIMESTAMP(3),
    "githubRepo"    TEXT,
    "githubRepoUrl" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById")
        REFERENCES "User"("id"),
    CONSTRAINT "Project_pmId_fkey" FOREIGN KEY ("pmId")
        REFERENCES "User"("id")
);

CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");


-- Tabla: ProjectMember
CREATE TABLE "ProjectMember" (
    "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID         NOT NULL,
    "userId"    UUID         NOT NULL,
    "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId")
        REFERENCES "Project"("id") ON DELETE CASCADE,
    CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");


-- Tabla: Sprint
CREATE TABLE "Sprint" (
    "id"           UUID           NOT NULL DEFAULT gen_random_uuid(),
    "projectId"    UUID           NOT NULL,
    "name"         TEXT           NOT NULL,
    "goal"         TEXT,
    "status"       "SprintStatus" NOT NULL DEFAULT 'PLANNING',
    "capacity"     INTEGER        NOT NULL DEFAULT 0,
    "startDate"    TIMESTAMP(3)   NOT NULL,
    "endDate"      TIMESTAMP(3)   NOT NULL,
    "completedAt"  TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "githubBranch" TEXT,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId")
        REFERENCES "Project"("id") ON DELETE CASCADE
);

CREATE INDEX "Sprint_projectId_idx" ON "Sprint"("projectId");
CREATE INDEX "Sprint_status_idx" ON "Sprint"("status");
CREATE INDEX "Sprint_startDate_endDate_idx" ON "Sprint"("startDate", "endDate");


-- Tabla: Ticket
CREATE TABLE "Ticket" (
    "id"              UUID            NOT NULL DEFAULT gen_random_uuid(),
    "projectId"       UUID            NOT NULL,
    "sprintId"        UUID            NOT NULL,
    "parentTicketId"  UUID,
    "title"           TEXT            NOT NULL,
    "description"     TEXT,
    "status"          "TicketStatus"  NOT NULL DEFAULT 'TODO',
    "priority"        "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "storyPoints"     INTEGER,
    "assignedToId"    UUID,
    "createdById"     UUID            NOT NULL,
    "startDate"       TIMESTAMP(3),
    "dueDate"         TIMESTAMP(3),
    "startedAt"       TIMESTAMP(3),
    "completedAt"     TIMESTAMP(3),
    "estimatedHours"  DOUBLE PRECISION,
    "actualHours"     DOUBLE PRECISION,
    "githubBranch"    TEXT,
    "githubPrNumber"  INTEGER,
    "githubPrUrl"     TEXT,
    "githubPrStatus"  TEXT,
    "createdAt"       TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId")
        REFERENCES "Project"("id") ON DELETE CASCADE,
    CONSTRAINT "Ticket_sprintId_fkey" FOREIGN KEY ("sprintId")
        REFERENCES "Sprint"("id") ON DELETE CASCADE,
    CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId")
        REFERENCES "User"("id"),
    CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById")
        REFERENCES "User"("id"),
    CONSTRAINT "Ticket_parentTicketId_fkey" FOREIGN KEY ("parentTicketId")
        REFERENCES "Ticket"("id")
);

CREATE INDEX "Ticket_projectId_idx" ON "Ticket"("projectId");
CREATE INDEX "Ticket_sprintId_idx" ON "Ticket"("sprintId");
CREATE INDEX "Ticket_assignedToId_idx" ON "Ticket"("assignedToId");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");
CREATE INDEX "Ticket_startDate_idx" ON "Ticket"("startDate");
CREATE INDEX "Ticket_dueDate_idx" ON "Ticket"("dueDate");
CREATE INDEX "Ticket_completedAt_idx" ON "Ticket"("completedAt");


-- Tabla: GamificationEvent
CREATE TABLE "GamificationEvent" (
    "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
    "ticketId"       UUID         NOT NULL,
    "userId"         UUID         NOT NULL,
    "projectId"      UUID         NOT NULL,
    "points"         INTEGER      NOT NULL,
    "priority"       TEXT         NOT NULL,
    "storyPoints"    INTEGER,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours"    DOUBLE PRECISION,
    "precision"      BOOLEAN      NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamificationEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GamificationEvent_ticketId_key" ON "GamificationEvent"("ticketId");
CREATE INDEX "GamificationEvent_userId_idx" ON "GamificationEvent"("userId");
CREATE INDEX "GamificationEvent_projectId_idx" ON "GamificationEvent"("projectId");


-- Tabla: ActivityLog
CREATE TABLE "ActivityLog" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "projectId"    UUID         NOT NULL,
    "userId"       UUID         NOT NULL,
    "userFullName" TEXT         NOT NULL,
    "entityType"   TEXT         NOT NULL,
    "entityId"     UUID         NOT NULL,
    "entityTitle"  TEXT,
    "action"       TEXT         NOT NULL,
    "metadata"     JSONB,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");


-- Tabla: Notification
CREATE TABLE "Notification" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "userId"      UUID         NOT NULL,
    "type"        TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT         NOT NULL,
    "projectName" TEXT,
    "read"        BOOLEAN      NOT NULL DEFAULT FALSE,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");


-- =============================================================================
-- FUNCIONES
-- =============================================================================

-- Función: Calcular velocidad de un sprint (suma de story points de tickets DONE)
CREATE OR REPLACE FUNCTION fn_sprint_velocity(p_sprint_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_velocity INTEGER;
BEGIN
    SELECT COALESCE(SUM(t."storyPoints"), 0)
    INTO v_velocity
    FROM "Ticket" t
    WHERE t."sprintId" = p_sprint_id
      AND t."status" = 'DONE'
      AND t."storyPoints" IS NOT NULL;

    RETURN v_velocity;
END;
$$ LANGUAGE plpgsql;


-- Función: Calcular puntos de gamificación para un ticket completado
-- Regla: base según prioridad + bonus si estimatedHours y actualHours están dentro del 20%
CREATE OR REPLACE FUNCTION fn_calculate_gamification_points(
    p_priority     TEXT,
    p_story_points INTEGER,
    p_est_hours    DOUBLE PRECISION,
    p_act_hours    DOUBLE PRECISION
)
RETURNS INTEGER AS $$
DECLARE
    v_base_points   INTEGER;
    v_bonus_points  INTEGER := 0;
    v_precision     BOOLEAN := FALSE;
BEGIN
    v_base_points := CASE p_priority
        WHEN 'CRITICAL' THEN 50
        WHEN 'HIGH'     THEN 30
        WHEN 'MEDIUM'   THEN 15
        WHEN 'LOW'      THEN 5
        ELSE 10
    END;

    -- Bonus por story points
    IF p_story_points IS NOT NULL AND p_story_points > 0 THEN
        v_base_points := v_base_points + (p_story_points * 2);
    END IF;

    -- Bonus de precisión: si las horas reales están dentro del ±20% de las estimadas
    IF p_est_hours IS NOT NULL AND p_act_hours IS NOT NULL AND p_est_hours > 0 THEN
        IF ABS(p_act_hours - p_est_hours) / p_est_hours <= 0.20 THEN
            v_precision    := TRUE;
            v_bonus_points := 10;
        END IF;
    END IF;

    RETURN v_base_points + v_bonus_points;
END;
$$ LANGUAGE plpgsql;


-- Función: Obtener porcentaje de completitud de un sprint
CREATE OR REPLACE FUNCTION fn_sprint_completion_pct(p_sprint_id UUID)
RETURNS NUMERIC(5,2) AS $$
DECLARE
    v_total INTEGER;
    v_done  INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM "Ticket" WHERE "sprintId" = p_sprint_id;

    IF v_total = 0 THEN RETURN 0.00; END IF;

    SELECT COUNT(*) INTO v_done
    FROM "Ticket"
    WHERE "sprintId" = p_sprint_id
      AND "status" IN ('DONE', 'CANCELLED');

    RETURN ROUND((v_done::NUMERIC / v_total) * 100, 2);
END;
$$ LANGUAGE plpgsql;


-- Función: Retornar total de puntos acumulados de un usuario
CREATE OR REPLACE FUNCTION fn_user_total_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COALESCE(SUM("points"), 0)
    INTO v_total
    FROM "GamificationEvent"
    WHERE "userId" = p_user_id;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;


-- Función: Verificar si un sprint puede activarse
-- Un sprint puede activarse solo si no hay otro sprint ACTIVE en el mismo proyecto
CREATE OR REPLACE FUNCTION fn_can_activate_sprint(p_sprint_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_project_id UUID;
    v_active_count INTEGER;
BEGIN
    SELECT "projectId" INTO v_project_id
    FROM "Sprint" WHERE "id" = p_sprint_id;

    SELECT COUNT(*) INTO v_active_count
    FROM "Sprint"
    WHERE "projectId" = v_project_id
      AND "status" = 'ACTIVE'
      AND "id" <> p_sprint_id;

    RETURN v_active_count = 0;
END;
$$ LANGUAGE plpgsql;


-- Función: Contar tickets vencidos en un proyecto (dueDate < NOW y no DONE/CANCELLED)
CREATE OR REPLACE FUNCTION fn_overdue_tickets_count(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM "Ticket"
    WHERE "projectId" = p_project_id
      AND "dueDate" < NOW()
      AND "status" NOT IN ('DONE', 'CANCELLED');

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- STORED PROCEDURES
-- =============================================================================

-- SP: Registrar un evento de gamificación al completar un ticket
CREATE OR REPLACE PROCEDURE sp_register_gamification_event(
    p_ticket_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_ticket     RECORD;
    v_points     INTEGER;
    v_precision  BOOLEAN := FALSE;
BEGIN
    -- Obtener datos del ticket
    SELECT t."id", t."userId" AS "assignedToId", t."projectId",
           t."priority"::TEXT, t."storyPoints",
           t."estimatedHours", t."actualHours",
           tk."assignedToId" AS "userId"
    INTO v_ticket
    FROM "Ticket" tk
    LEFT JOIN "Ticket" t ON t."id" = tk."id"
    WHERE tk."id" = p_ticket_id;

    -- Obtener datos reales del ticket
    SELECT tk."assignedToId", tk."projectId",
           tk."priority"::TEXT, tk."storyPoints",
           tk."estimatedHours", tk."actualHours"
    INTO v_ticket
    FROM "Ticket" tk
    WHERE tk."id" = p_ticket_id;

    IF v_ticket."assignedToId" IS NULL THEN
        RAISE NOTICE 'Ticket % sin asignar, no se registra gamification', p_ticket_id;
        RETURN;
    END IF;

    -- Calcular puntos
    v_points := fn_calculate_gamification_points(
        v_ticket."priority",
        v_ticket."storyPoints",
        v_ticket."estimatedHours",
        v_ticket."actualHours"
    );

    -- Verificar precisión
    IF v_ticket."estimatedHours" IS NOT NULL AND v_ticket."actualHours" IS NOT NULL
       AND v_ticket."estimatedHours" > 0 THEN
        v_precision := ABS(v_ticket."actualHours" - v_ticket."estimatedHours")
                       / v_ticket."estimatedHours" <= 0.20;
    END IF;

    -- Insertar o ignorar si ya existe
    INSERT INTO "GamificationEvent" (
        "ticketId", "userId", "projectId", "points",
        "priority", "storyPoints", "estimatedHours", "actualHours", "precision"
    )
    VALUES (
        p_ticket_id,
        v_ticket."assignedToId",
        v_ticket."projectId",
        v_points,
        v_ticket."priority",
        v_ticket."storyPoints",
        v_ticket."estimatedHours",
        v_ticket."actualHours",
        v_precision
    )
    ON CONFLICT ("ticketId") DO NOTHING;

    RAISE NOTICE 'Gamification registrada: % puntos para usuario %', v_points, v_ticket."assignedToId";
END;
$$;


-- SP: Completar un sprint (marcar como COMPLETED y registrar completedAt)
CREATE OR REPLACE PROCEDURE sp_complete_sprint(
    p_sprint_id UUID,
    p_executor_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_sprint    RECORD;
    v_velocity  INTEGER;
BEGIN
    SELECT * INTO v_sprint FROM "Sprint" WHERE "id" = p_sprint_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sprint % no encontrado', p_sprint_id;
    END IF;

    IF v_sprint."status" <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Solo se pueden completar sprints en estado ACTIVE. Estado actual: %', v_sprint."status";
    END IF;

    -- Actualizar sprint
    UPDATE "Sprint"
    SET "status"      = 'COMPLETED',
        "completedAt" = NOW(),
        "updatedAt"   = NOW()
    WHERE "id" = p_sprint_id;

    -- Calcular velocidad final
    v_velocity := fn_sprint_velocity(p_sprint_id);

    -- Registrar actividad
    INSERT INTO "ActivityLog" (
        "projectId", "userId", "userFullName",
        "entityType", "entityId", "entityTitle",
        "action", "metadata"
    )
    SELECT
        v_sprint."projectId",
        p_executor_id,
        u."fullName",
        'SPRINT',
        p_sprint_id,
        v_sprint."name",
        'COMPLETED',
        jsonb_build_object('velocity', v_velocity)
    FROM "User" u WHERE u."id" = p_executor_id;

    RAISE NOTICE 'Sprint % completado con velocidad de % story points', v_sprint."name", v_velocity;
END;
$$;


-- SP: Archivar un proyecto
CREATE OR REPLACE PROCEDURE sp_archive_project(
    p_project_id  UUID,
    p_executor_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_project RECORD;
BEGIN
    SELECT * INTO v_project FROM "Project" WHERE "id" = p_project_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proyecto % no encontrado', p_project_id;
    END IF;

    UPDATE "Project"
    SET "status"     = 'ARCHIVED',
        "archivedAt" = NOW(),
        "updatedAt"  = NOW()
    WHERE "id" = p_project_id;

    INSERT INTO "ActivityLog" (
        "projectId", "userId", "userFullName",
        "entityType", "entityId", "entityTitle",
        "action", "metadata"
    )
    SELECT
        p_project_id,
        p_executor_id,
        u."fullName",
        'PROJECT',
        p_project_id,
        v_project."name",
        'ARCHIVED',
        NULL
    FROM "User" u WHERE u."id" = p_executor_id;

    RAISE NOTICE 'Proyecto % archivado', v_project."name";
END;
$$;


-- SP: Reasignar todos los tickets de un usuario a otro dentro de un proyecto
CREATE OR REPLACE PROCEDURE sp_reassign_tickets(
    p_project_id   UUID,
    p_from_user_id UUID,
    p_to_user_id   UUID,
    p_executor_id  UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_count    INTEGER;
    v_executor RECORD;
BEGIN
    SELECT * INTO v_executor FROM "User" WHERE "id" = p_executor_id;

    UPDATE "Ticket"
    SET "assignedToId" = p_to_user_id,
        "updatedAt"    = NOW()
    WHERE "projectId"  = p_project_id
      AND "assignedToId" = p_from_user_id
      AND "status" NOT IN ('DONE', 'CANCELLED');

    GET DIAGNOSTICS v_count = ROW_COUNT;

    INSERT INTO "ActivityLog" (
        "projectId", "userId", "userFullName",
        "entityType", "entityId", "entityTitle",
        "action", "metadata"
    )
    VALUES (
        p_project_id,
        p_executor_id,
        v_executor."fullName",
        'PROJECT',
        p_project_id,
        NULL,
        'TICKETS_REASSIGNED',
        jsonb_build_object(
            'fromUserId', p_from_user_id,
            'toUserId',   p_to_user_id,
            'count',      v_count
        )
    );

    RAISE NOTICE '% ticket(s) reasignados', v_count;
END;
$$;


-- SP: Enviar notificación a todos los miembros de un proyecto
CREATE OR REPLACE PROCEDURE sp_notify_project_members(
    p_project_id  UUID,
    p_type        TEXT,
    p_title       TEXT,
    p_description TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_project_name TEXT;
    v_member       RECORD;
BEGIN
    SELECT "name" INTO v_project_name FROM "Project" WHERE "id" = p_project_id;

    FOR v_member IN
        SELECT DISTINCT pm."userId"
        FROM "ProjectMember" pm
        WHERE pm."projectId" = p_project_id
          AND pm."leftAt" IS NULL
    LOOP
        INSERT INTO "Notification" ("userId", "type", "title", "description", "projectName")
        VALUES (v_member."userId", p_type, p_title, p_description, v_project_name);
    END LOOP;

    RAISE NOTICE 'Notificaciones enviadas a los miembros del proyecto %', v_project_name;
END;
$$;


-- SP: Soft-delete de usuario (marcar deletedAt y desactivar)
CREATE OR REPLACE PROCEDURE sp_soft_delete_user(p_user_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "User"
    SET "deletedAt" = NOW(),
        "status"    = 'INACTIVE',
        "updatedAt" = NOW()
    WHERE "id" = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario % no encontrado', p_user_id;
    END IF;

    RAISE NOTICE 'Usuario % desactivado (soft delete)', p_user_id;
END;
$$;


-- =============================================================================
-- INSERCIÓN DE DATOS (DATOS DE PRUEBA)
-- =============================================================================

-- USUARIOS
-- Contraseñas hasheadas con bcrypt (valor de prueba: "Password123!")
INSERT INTO "User" ("id", "email", "passwordHash", "fullName", "role", "status", "mustChangePassword", "createdAt", "updatedAt")
VALUES
    ('a1b2c3d4-0001-0001-0001-000000000001',
     'admin@taskhub.dev',
     '$2b$10$examplehashADMIN1111111111111111111111111111111111111',
     'Admin Principal',
     'ADMIN', 'ACTIVE', FALSE, NOW(), NOW()),

    ('a1b2c3d4-0002-0002-0002-000000000002',
     'marco.salinas@taskhub.dev',
     '$2b$10$examplehashPM111111111111111111111111111111111111111111',
     'Marco Salinas',
     'PM', 'ACTIVE', FALSE, NOW(), NOW()),

    ('a1b2c3d4-0003-0003-0003-000000000003',
     'ivan.ornelas@taskhub.dev',
     '$2b$10$examplehashDEV1111111111111111111111111111111111111111',
     'Ivan Ornelas',
     'DEVELOPER', 'ACTIVE', FALSE, NOW(), NOW()),

    ('a1b2c3d4-0004-0004-0004-000000000004',
     'fatima.alonso@taskhub.dev',
     '$2b$10$examplehashDEV2222222222222222222222222222222222222222',
     'Fatima Alonso',
     'DEVELOPER', 'ACTIVE', FALSE, NOW(), NOW()),

    ('a1b2c3d4-0005-0005-0005-000000000005',
     'josue.tijerina@taskhub.dev',
     '$2b$10$examplehashDEV3333333333333333333333333333333333333333',
     'Josué Tijerina',
     'DEVELOPER', 'ACTIVE', FALSE, NOW(), NOW()),

    ('a1b2c3d4-0006-0006-0006-000000000006',
     'julieta.lozano@taskhub.dev',
     '$2b$10$examplehashDEV4444444444444444444444444444444444444444',
     'Julieta Lozano',
     'DEVELOPER', 'ACTIVE', FALSE, NOW(), NOW()),

    ('a1b2c3d4-0007-0007-0007-000000000007',
     'viewer@taskhub.dev',
     '$2b$10$examplehashVIEWER111111111111111111111111111111111111',
     'Cliente Viewer',
     'VIEWER', 'ACTIVE', FALSE, NOW(), NOW());


-- PROYECTOS
INSERT INTO "Project" (
    "id", "name", "description", "code", "status", "riskLevel",
    "createdById", "pmId", "startDate", "targetEndDate", "budget",
    "createdAt", "updatedAt"
)
VALUES
    ('b1b2c3d4-0001-0001-0001-000000000001',
     'TaskHub Platform',
     'Sistema de gestión ágil de proyectos con SCRUM. Proyecto principal del equipo.',
     'TASKHUB',
     'ACTIVE', 'MEDIUM',
     'a1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-01-01 00:00:00',
     '2026-08-31 00:00:00',
     50000.00,
     NOW(), NOW()),

    ('b1b2c3d4-0002-0002-0002-000000000002',
     'App Mobile Cliente',
     'Aplicación móvil complementaria al sistema TaskHub para consulta rápida.',
     'MOBILE',
     'ACTIVE', 'HIGH',
     'a1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-03-01 00:00:00',
     '2026-09-30 00:00:00',
     25000.00,
     NOW(), NOW()),

    ('b1b2c3d4-0003-0003-0003-000000000003',
     'Módulo de Reportes',
     'Exportación de reportes en PDF y Excel con gráficas ejecutivas.',
     'REPORTS',
     'ON_HOLD', 'LOW',
     'a1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-05-01 00:00:00',
     '2026-10-31 00:00:00',
     12000.00,
     NOW(), NOW());


-- MIEMBROS DE PROYECTO
INSERT INTO "ProjectMember" ("id", "projectId", "userId", "joinedAt", "createdAt")
VALUES
    (gen_random_uuid(), 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0002-0002-0002-000000000002', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0003-0003-0003-000000000003', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0004-0004-0004-000000000004', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0005-0005-0005-000000000005', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0006-0006-0006-000000000006', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0007-0007-0007-000000000007', NOW(), NOW()),

    (gen_random_uuid(), 'b1b2c3d4-0002-0002-0002-000000000002', 'a1b2c3d4-0002-0002-0002-000000000002', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0002-0002-0002-000000000002', 'a1b2c3d4-0003-0003-0003-000000000003', NOW(), NOW()),
    (gen_random_uuid(), 'b1b2c3d4-0002-0002-0002-000000000002', 'a1b2c3d4-0005-0005-0005-000000000005', NOW(), NOW());


-- SPRINTS
INSERT INTO "Sprint" (
    "id", "projectId", "name", "goal", "status", "capacity",
    "startDate", "endDate", "completedAt", "createdAt", "updatedAt"
)
VALUES
    ('c1b2c3d4-0001-0001-0001-000000000001',
     'b1b2c3d4-0001-0001-0001-000000000001',
     'Sprint 1 - Base',
     'Configurar infraestructura base: auth, modelos, CI/CD.',
     'COMPLETED', 40,
     '2026-01-06 00:00:00', '2026-01-19 00:00:00', '2026-01-19 18:00:00',
     NOW(), NOW()),

    ('c1b2c3d4-0002-0002-0002-000000000002',
     'b1b2c3d4-0001-0001-0001-000000000001',
     'Sprint 2 - Core Features',
     'CRUD de proyectos, sprints y tickets con control de roles.',
     'COMPLETED', 45,
     '2026-01-20 00:00:00', '2026-02-02 00:00:00', '2026-02-02 18:00:00',
     NOW(), NOW()),

    ('c1b2c3d4-0003-0003-0003-000000000003',
     'b1b2c3d4-0001-0001-0001-000000000001',
     'Sprint 3 - Analytics & Gamification',
     'Módulo de analíticas, gamificación y sistema de notificaciones.',
     'ACTIVE', 50,
     '2026-02-03 00:00:00', '2026-02-16 00:00:00', NULL,
     NOW(), NOW()),

    ('c1b2c3d4-0004-0004-0004-000000000004',
     'b1b2c3d4-0001-0001-0001-000000000001',
     'Sprint 4 - AI & Reportes',
     'Integración de LLM para asistente IA y módulo de exportación.',
     'PLANNING', 40,
     '2026-02-17 00:00:00', '2026-03-02 00:00:00', NULL,
     NOW(), NOW()),

    ('c1b2c3d4-0005-0005-0005-000000000005',
     'b1b2c3d4-0002-0002-0002-000000000002',
     'Sprint 1 Mobile - Setup',
     'Setup del proyecto React Native y pantallas de autenticación.',
     'ACTIVE', 30,
     '2026-03-10 00:00:00', '2026-03-23 00:00:00', NULL,
     NOW(), NOW());


-- TICKETS (Sprint 1 - COMPLETED)
INSERT INTO "Ticket" (
    "id", "projectId", "sprintId", "title", "description",
    "status", "priority", "storyPoints",
    "assignedToId", "createdById",
    "startDate", "dueDate", "startedAt", "completedAt",
    "estimatedHours", "actualHours",
    "createdAt", "updatedAt"
)
VALUES
    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0001-0001-0001-000000000001',
     'Configurar proyecto Node.js + Express + Prisma',
     'Inicializar repositorio, instalar dependencias base, configurar ESLint y estructura de carpetas.',
     'DONE', 'HIGH', 5,
     'a1b2c3d4-0003-0003-0003-000000000003',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-01-06', '2026-01-08', '2026-01-06 09:00:00', '2026-01-08 17:00:00',
     8.0, 7.5,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0001-0001-0001-000000000001',
     'Implementar autenticación JWT con httpOnly cookies',
     'Login, refresh token, logout y middleware de autenticación.',
     'DONE', 'CRITICAL', 8,
     'a1b2c3d4-0004-0004-0004-000000000004',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-01-07', '2026-01-12', '2026-01-07 09:00:00', '2026-01-12 16:00:00',
     16.0, 18.0,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0001-0001-0001-000000000001',
     'Flujo OTP para nuevo usuario',
     'Generar OTP, enviar por email con EmailJS, verificar y permitir set-password.',
     'DONE', 'HIGH', 5,
     'a1b2c3d4-0006-0006-0006-000000000006',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-01-10', '2026-01-14', '2026-01-10 10:00:00', '2026-01-14 15:00:00',
     10.0, 9.5,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0001-0001-0001-000000000001',
     'Configurar CI/CD con GitHub Actions',
     'Pipeline de lint + tests en PR y deploy automático a Render en merge a main.',
     'DONE', 'MEDIUM', 3,
     'a1b2c3d4-0005-0005-0005-000000000005',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-01-13', '2026-01-16', '2026-01-13 09:00:00', '2026-01-15 17:00:00',
     6.0, 5.0,
     NOW(), NOW());


-- TICKETS (Sprint 3 - ACTIVE, mix de estados)
INSERT INTO "Ticket" (
    "id", "projectId", "sprintId", "title", "description",
    "status", "priority", "storyPoints",
    "assignedToId", "createdById",
    "startDate", "dueDate", "startedAt", "completedAt",
    "estimatedHours", "actualHours",
    "createdAt", "updatedAt"
)
VALUES
    ('d1b2c3d4-0001-0001-0001-000000000001',
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0003-0003-0003-000000000003',
     'Endpoint GET /analytics/project/:id/dashboard',
     'Retornar métricas clave del proyecto: tickets por estado, velocidad, burndown.',
     'DONE', 'HIGH', 8,
     'a1b2c3d4-0003-0003-0003-000000000003',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-02-03', '2026-02-07', '2026-02-03 09:00:00', '2026-02-07 16:00:00',
     14.0, 13.0,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0003-0003-0003-000000000003',
     'Sistema de puntos de gamificación',
     'Calcular y registrar puntos al completar un ticket según prioridad y precisión de estimación.',
     'IN_PROGRESS', 'HIGH', 8,
     'a1b2c3d4-0004-0004-0004-000000000004',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-02-05', '2026-02-12', '2026-02-05 10:00:00', NULL,
     16.0, NULL,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0003-0003-0003-000000000003',
     'Leaderboard de gamificación por proyecto',
     'Endpoint que retorna ranking de usuarios con sus puntos totales en el proyecto.',
     'TODO', 'MEDIUM', 5,
     'a1b2c3d4-0006-0006-0006-000000000006',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-02-10', '2026-02-14', NULL, NULL,
     10.0, NULL,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0003-0003-0003-000000000003',
     'Persistencia de notificaciones en base de datos',
     'Guardar notificaciones en tabla Notification y marcar como leídas.',
     'IN_REVIEW', 'HIGH', 5,
     'a1b2c3d4-0005-0005-0005-000000000005',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-02-04', '2026-02-10', '2026-02-04 09:00:00', NULL,
     8.0, NULL,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0003-0003-0003-000000000003',
     'Integrar pgvector para búsqueda semántica de tickets',
     'Generar embeddings con modelo de Anthropic y almacenar en columna vector(768) del Ticket.',
     'BLOCKED', 'MEDIUM', 8,
     'a1b2c3d4-0003-0003-0003-000000000003',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-02-06', '2026-02-14', '2026-02-06 11:00:00', NULL,
     20.0, NULL,
     NOW(), NOW()),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'c1b2c3d4-0003-0003-0003-000000000003',
     'UI: conectar Dashboard con endpoint real',
     'Reemplazar mockData.ts del dashboard con llamadas al API de analytics.',
     'TODO', 'HIGH', 5,
     'a1b2c3d4-0004-0004-0004-000000000004',
     'a1b2c3d4-0002-0002-0002-000000000002',
     '2026-02-10', '2026-02-15', NULL, NULL,
     10.0, NULL,
     NOW(), NOW());


-- EVENTOS DE GAMIFICACIÓN (de tickets completados)
INSERT INTO "GamificationEvent" (
    "id", "ticketId", "userId", "projectId",
    "points", "priority", "storyPoints",
    "estimatedHours", "actualHours", "precision",
    "createdAt"
)
VALUES
    (gen_random_uuid(),
     'd1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0003-0003-0003-000000000003',
     'b1b2c3d4-0001-0001-0001-000000000001',
     46, 'HIGH', 8, 14.0, 13.0, TRUE,
     '2026-02-07 16:00:00');


-- ACTIVITY LOG (muestras)
INSERT INTO "ActivityLog" (
    "id", "projectId", "userId", "userFullName",
    "entityType", "entityId", "entityTitle",
    "action", "metadata", "createdAt"
)
VALUES
    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0002-0002-0002-000000000002',
     'Marco Salinas',
     'SPRINT',
     'c1b2c3d4-0001-0001-0001-000000000001',
     'Sprint 1 - Base',
     'COMPLETED',
     '{"velocity": 21}',
     '2026-01-19 18:00:00'),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0003-0003-0003-000000000003',
     'Ivan Ornelas',
     'TICKET',
     'd1b2c3d4-0001-0001-0001-000000000001',
     'Endpoint GET /analytics/project/:id/dashboard',
     'STATUS_CHANGED',
     '{"from": "IN_PROGRESS", "to": "DONE"}',
     '2026-02-07 16:00:00'),

    (gen_random_uuid(),
     'b1b2c3d4-0001-0001-0001-000000000001',
     'a1b2c3d4-0002-0002-0002-000000000002',
     'Marco Salinas',
     'PROJECT',
     'b1b2c3d4-0001-0001-0001-000000000001',
     'TaskHub Platform',
     'RISK_UPDATED',
     '{"from": "LOW", "to": "MEDIUM"}',
     '2026-02-01 10:00:00');


-- NOTIFICACIONES
INSERT INTO "Notification" (
    "id", "userId", "type", "title", "description", "projectName", "read", "createdAt"
)
VALUES
    (gen_random_uuid(),
     'a1b2c3d4-0003-0003-0003-000000000003',
     'TICKET_ASSIGNED',
     'Nuevo ticket asignado',
     'Se te asignó el ticket "Integrar pgvector para búsqueda semántica de tickets".',
     'TaskHub Platform', FALSE, NOW()),

    (gen_random_uuid(),
     'a1b2c3d4-0004-0004-0004-000000000004',
     'TICKET_ASSIGNED',
     'Nuevo ticket asignado',
     'Se te asignó el ticket "Sistema de puntos de gamificación".',
     'TaskHub Platform', FALSE, NOW()),

    (gen_random_uuid(),
     'a1b2c3d4-0003-0003-0003-000000000003',
     'SPRINT_STARTED',
     'Sprint iniciado',
     'El Sprint 3 - Analytics & Gamification ha comenzado.',
     'TaskHub Platform', TRUE, '2026-02-03 09:00:00'),

    (gen_random_uuid(),
     'a1b2c3d4-0005-0005-0005-000000000005',
     'GAMIFICATION_POINTS',
     '¡Ganaste puntos!',
     'Completaste un ticket a tiempo y obtuviste 46 puntos de precisión.',
     'TaskHub Platform', FALSE, '2026-02-07 16:30:00'),

    (gen_random_uuid(),
     'a1b2c3d4-0006-0006-0006-000000000006',
     'TICKET_ASSIGNED',
     'Nuevo ticket asignado',
     'Se te asignó el ticket "Leaderboard de gamificación por proyecto".',
     'TaskHub Platform', FALSE, NOW());


-- =============================================================================
-- VERIFICACIÓN RÁPIDA
-- =============================================================================

-- Usuarios registrados
SELECT "fullName", "role", "status" FROM "User" ORDER BY "role";

-- Proyectos con su PM
SELECT p."name", p."code", p."status", u."fullName" AS "pm"
FROM "Project" p
LEFT JOIN "User" u ON u."id" = p."pmId"
ORDER BY p."createdAt";

-- Velocidad del Sprint 1
SELECT fn_sprint_velocity('c1b2c3d4-0001-0001-0001-000000000001') AS "velocidad_sprint1";

-- Completitud del Sprint 3 (activo)
SELECT fn_sprint_completion_pct('c1b2c3d4-0003-0003-0003-000000000003') AS "pct_completado_sprint3";

-- Puntos totales por usuario en gamificación
SELECT u."fullName", fn_user_total_points(u."id") AS "puntos_totales"
FROM "User" u
WHERE u."role" = 'DEVELOPER'
ORDER BY "puntos_totales" DESC;
