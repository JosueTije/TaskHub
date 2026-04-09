-- ============================================
-- TASKHUB - POSTGRESQL DATABASE SCHEMA
-- Sistema completo de Project Management
-- Incluye: Proyectos, Sprints, Tickets, Subtickets, 
-- Gamificación, Métricas, IA, y más
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'PM', 'DEVELOPER');
CREATE TYPE project_status AS ENUM ('Active', 'On Hold', 'Archived', 'Completed');
CREATE TYPE project_risk AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE sprint_status AS ENUM ('Planning', 'Active', 'Completed', 'Cancelled');
CREATE TYPE ticket_status AS ENUM ('Backlog', 'To Do', 'In Progress', 'In Review', 'Done', 'Blocked');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE ticket_type AS ENUM ('Feature', 'Bug', 'Task', 'Epic', 'Story');
CREATE TYPE milestone_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Delayed');
CREATE TYPE activity_type AS ENUM ('project_created', 'project_updated', 'sprint_created', 'sprint_updated', 'ticket_created', 'ticket_updated', 'ticket_assigned', 'comment_added', 'milestone_created', 'milestone_updated', 'team_member_added', 'team_member_removed', 'status_changed', 'priority_changed');
CREATE TYPE badge_type AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
CREATE TYPE notification_type AS ENUM ('ticket_assigned', 'ticket_updated', 'mention', 'deadline', 'sprint_started', 'sprint_ended', 'milestone_completed', 'badge_earned');

-- ============================================
-- TABLA: users
-- Usuarios del sistema con autenticación y roles
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar VARCHAR(10), -- Emoji o iniciales
    role user_role NOT NULL DEFAULT 'DEVELOPER',
    is_active BOOLEAN DEFAULT true,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'es',
    theme VARCHAR(20) DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: projects
-- Proyectos principales del sistema
-- ============================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status project_status DEFAULT 'Active',
    risk project_risk DEFAULT 'Low',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    closed_date DATE,
    closed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Métricas calculadas
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    spi DECIMAL(5,2) DEFAULT 1.00, -- Schedule Performance Index
    cpi DECIMAL(5,2) DEFAULT 1.00, -- Cost Performance Index
    budget DECIMAL(15,2),
    spent DECIMAL(15,2) DEFAULT 0,
    
    -- Configuración
    working_hours_per_day INTEGER DEFAULT 8,
    working_days_per_week INTEGER DEFAULT 5,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- ============================================
-- TABLA: project_members
-- Relación muchos a muchos: Proyectos - Usuarios
-- ============================================

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(project_id, user_id)
);

-- ============================================
-- TABLA: sprints
-- Sprints de cada proyecto (cada sprint tiene su propio backlog)
-- ============================================

CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    status sprint_status DEFAULT 'Planning',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Métricas del sprint
    planned_points INTEGER DEFAULT 0,
    completed_points INTEGER DEFAULT 0,
    velocity DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_sprint_dates CHECK (end_date >= start_date)
);

-- ============================================
-- TABLA: tickets
-- Tickets/Tareas del sistema (con soporte para subtickets)
-- ============================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL, -- TH-001, TH-002, etc.
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Relaciones
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE RESTRICT, -- SIEMPRE tiene sprint asignado
    parent_ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE, -- Para subtickets
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Estados y clasificación
    status ticket_status DEFAULT 'Backlog',
    priority ticket_priority DEFAULT 'Medium',
    type ticket_type DEFAULT 'Task',
    
    -- Estimación y tracking
    story_points INTEGER,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2) DEFAULT 0,
    
    -- Fechas
    due_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[], -- Array de tags
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: milestones
-- Hitos/Milestones del proyecto
-- ============================================

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status milestone_status DEFAULT 'Pending',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: milestone_tickets
-- Relación muchos a muchos: Milestones - Tickets
-- ============================================

CREATE TABLE milestone_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    UNIQUE(milestone_id, ticket_id)
);

-- ============================================
-- TABLA: comments
-- Comentarios en tickets
-- ============================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para hilos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: activity_logs
-- Registro de actividades del sistema
-- ============================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    
    activity_type activity_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB, -- Datos adicionales en formato JSON
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: attachments
-- Archivos adjuntos
-- ============================================

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    file_name VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL, -- En bytes
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (ticket_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- ============================================
-- TABLA: gamification_badges
-- Definición de badges/insignias
-- ============================================

CREATE TABLE gamification_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- Nombre del icono o emoji
    type badge_type NOT NULL,
    points_reward INTEGER DEFAULT 0,
    criteria JSONB, -- Criterios para obtener el badge
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: user_badges
-- Badges obtenidos por usuarios
-- ============================================

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES gamification_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, badge_id)
);

-- ============================================
-- TABLA: user_points
-- Sistema de puntos por usuario y proyecto
-- ============================================

CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    total_points INTEGER DEFAULT 0,
    tickets_completed INTEGER DEFAULT 0,
    bugs_fixed INTEGER DEFAULT 0,
    reviews_done INTEGER DEFAULT 0,
    sprint_contributions INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, project_id)
);

-- ============================================
-- TABLA: achievements
-- Logros específicos de usuarios
-- ============================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB,
    
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: notifications
-- Notificaciones para usuarios
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Referencias opcionales
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: ai_insights
-- Insights generados por IA
-- ============================================

CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    insight_type VARCHAR(100) NOT NULL, -- risk_detection, schedule_prediction, resource_optimization, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50), -- low, medium, high, critical
    
    recommendations JSONB, -- Array de recomendaciones
    metrics JSONB, -- Métricas asociadas
    
    is_active BOOLEAN DEFAULT true,
    dismissed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: burndown_data
-- Datos para gráficos burndown
-- ============================================

CREATE TABLE burndown_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    planned_points INTEGER NOT NULL,
    remaining_points INTEGER NOT NULL,
    completed_points INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(sprint_id, date)
);

-- ============================================
-- TABLA: time_tracking
-- Seguimiento de tiempo trabajado
-- ============================================

CREATE TABLE time_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: project_settings
-- Configuraciones específicas por proyecto
-- ============================================

CREATE TABLE project_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Configuraciones de workflow
    enabled_statuses TEXT[] DEFAULT ARRAY['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'],
    enabled_priorities TEXT[] DEFAULT ARRAY['Low', 'Medium', 'High', 'Critical'],
    enabled_types TEXT[] DEFAULT ARRAY['Feature', 'Bug', 'Task'],
    
    -- Configuraciones de sprint
    default_sprint_duration_days INTEGER DEFAULT 14,
    auto_close_sprint BOOLEAN DEFAULT false,
    
    -- Configuraciones de notificaciones
    notify_on_ticket_assign BOOLEAN DEFAULT true,
    notify_on_ticket_update BOOLEAN DEFAULT true,
    notify_on_mention BOOLEAN DEFAULT true,
    
    -- Gamificación
    gamification_enabled BOOLEAN DEFAULT true,
    
    settings JSONB, -- Configuraciones adicionales
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES para optimización de consultas
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);

-- Project Members
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Sprints
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- Tickets
CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_sprint_id ON tickets(sprint_id);
CREATE INDEX idx_tickets_parent_ticket_id ON tickets(parent_ticket_id);
CREATE INDEX idx_tickets_assigned_to_id ON tickets(assigned_to_id);
CREATE INDEX idx_tickets_created_by_id ON tickets(created_by_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_tags ON tickets USING GIN(tags);

-- Milestones
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- Comments
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_ticket_id ON activity_logs(ticket_id);
CREATE INDEX idx_activity_logs_activity_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- User Points
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_project_id ON user_points(project_id);

-- Time Tracking
CREATE INDEX idx_time_tracking_ticket_id ON time_tracking(ticket_id);
CREATE INDEX idx_time_tracking_user_id ON time_tracking(user_id);

-- Burndown Data
CREATE INDEX idx_burndown_data_sprint_id ON burndown_data(sprint_id);
CREATE INDEX idx_burndown_data_date ON burndown_data(date);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de ticket automáticamente
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    project_prefix VARCHAR(10);
    next_number INTEGER;
BEGIN
    -- Obtener prefijo del proyecto (primeras 2-3 letras del nombre)
    SELECT UPPER(SUBSTRING(name FROM 1 FOR 3)) INTO project_prefix
    FROM projects WHERE id = NEW.project_id;
    
    -- Obtener el siguiente número
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM tickets
    WHERE project_id = NEW.project_id;
    
    -- Asignar el número de ticket
    NEW.ticket_number = project_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- Función para calcular progreso del proyecto basado en tickets
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_tickets INTEGER;
    completed_tickets INTEGER;
    new_progress INTEGER;
BEGIN
    -- Contar tickets totales y completados
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'Done')
    INTO total_tickets, completed_tickets
    FROM tickets
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
    
    -- Calcular progreso
    IF total_tickets > 0 THEN
        new_progress = ROUND((completed_tickets::DECIMAL / total_tickets) * 100);
    ELSE
        new_progress = 0;
    END IF;
    
    -- Actualizar proyecto
    UPDATE projects
    SET progress = new_progress
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_progress_on_ticket_change
    AFTER INSERT OR UPDATE OF status OR DELETE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_project_progress();

-- Función para registrar actividades automáticamente
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (user_id, project_id, ticket_id, activity_type, description)
        VALUES (
            NEW.created_by_id,
            NEW.project_id,
            NEW.id,
            'ticket_created',
            'Ticket creado: ' || NEW.title
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO activity_logs (user_id, project_id, ticket_id, activity_type, description, metadata)
            VALUES (
                NEW.assigned_to_id,
                NEW.project_id,
                NEW.id,
                'status_changed',
                'Estado cambiado de ' || OLD.status || ' a ' || NEW.status,
                jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
            );
        END IF;
        
        IF OLD.assigned_to_id IS DISTINCT FROM NEW.assigned_to_id THEN
            INSERT INTO activity_logs (user_id, project_id, ticket_id, activity_type, description)
            VALUES (
                NEW.assigned_to_id,
                NEW.project_id,
                NEW.id,
                'ticket_assigned',
                'Ticket asignado a ' || (SELECT full_name FROM users WHERE id = NEW.assigned_to_id)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_ticket_activity
    AFTER INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Función para actualizar puntos de gamificación
CREATE OR REPLACE FUNCTION update_gamification_points()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Done' AND OLD.status != 'Done' THEN
        -- Calcular puntos basados en prioridad y story points
        DECLARE
            points INTEGER := COALESCE(NEW.story_points, 1);
            bonus INTEGER := CASE NEW.priority
                WHEN 'Critical' THEN 5
                WHEN 'High' THEN 3
                WHEN 'Medium' THEN 2
                ELSE 1
            END;
        BEGIN
            INSERT INTO user_points (user_id, project_id, total_points, tickets_completed)
            VALUES (NEW.assigned_to_id, NEW.project_id, points + bonus, 1)
            ON CONFLICT (user_id, project_id)
            DO UPDATE SET
                total_points = user_points.total_points + points + bonus,
                tickets_completed = user_points.tickets_completed + 1,
                updated_at = CURRENT_TIMESTAMP;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gamification_on_ticket_complete
    AFTER UPDATE OF status ON tickets
    FOR EACH ROW
    WHEN (NEW.assigned_to_id IS NOT NULL)
    EXECUTE FUNCTION update_gamification_points();

-- Función para actualizar métricas de sprint
CREATE OR REPLACE FUNCTION update_sprint_metrics()
RETURNS TRIGGER AS $$
DECLARE
    total_planned INTEGER;
    total_completed INTEGER;
BEGIN
    -- Calcular story points planeados y completados
    SELECT 
        COALESCE(SUM(story_points), 0),
        COALESCE(SUM(CASE WHEN status = 'Done' THEN story_points ELSE 0 END), 0)
    INTO total_planned, total_completed
    FROM tickets
    WHERE sprint_id = COALESCE(NEW.sprint_id, OLD.sprint_id);
    
    -- Actualizar sprint
    UPDATE sprints
    SET 
        planned_points = total_planned,
        completed_points = total_completed,
        velocity = CASE 
            WHEN total_planned > 0 THEN (total_completed::DECIMAL / total_planned) * 100
            ELSE 0
        END
    WHERE id = COALESCE(NEW.sprint_id, OLD.sprint_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sprint_metrics_on_ticket_change
    AFTER INSERT OR UPDATE OF status, story_points OR DELETE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_sprint_metrics();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Resumen de proyectos con métricas
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.progress,
    p.spi,
    p.start_date,
    p.end_date,
    u.full_name as manager_name,
    COUNT(DISTINCT pm.user_id) as team_size,
    COUNT(DISTINCT s.id) as total_sprints,
    COUNT(DISTINCT t.id) as total_tickets,
    COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as completed_tickets,
    COUNT(DISTINCT CASE WHEN t.status = 'Blocked' THEN t.id END) as blocked_tickets
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN sprints s ON p.id = s.project_id
LEFT JOIN tickets t ON p.id = t.project_id
GROUP BY p.id, u.full_name;

-- Vista: Tickets con toda la información relacionada
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
    t.id,
    t.ticket_number,
    t.title,
    t.status,
    t.priority,
    t.type,
    t.story_points,
    t.created_at,
    p.name as project_name,
    s.name as sprint_name,
    creator.full_name as created_by,
    assignee.full_name as assigned_to,
    parent.ticket_number as parent_ticket_number,
    COUNT(DISTINCT subtask.id) as subtasks_count,
    COUNT(DISTINCT c.id) as comments_count
FROM tickets t
JOIN projects p ON t.project_id = p.id
JOIN sprints s ON t.sprint_id = s.id
JOIN users creator ON t.created_by_id = creator.id
LEFT JOIN users assignee ON t.assigned_to_id = assignee.id
LEFT JOIN tickets parent ON t.parent_ticket_id = parent.id
LEFT JOIN tickets subtask ON subtask.parent_ticket_id = t.id
LEFT JOIN comments c ON t.id = c.ticket_id
GROUP BY t.id, p.name, s.name, creator.full_name, assignee.full_name, parent.ticket_number;

-- Vista: Leaderboard de gamificación
CREATE OR REPLACE VIEW gamification_leaderboard AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.avatar,
    COALESCE(SUM(up.total_points), 0) as total_points,
    COALESCE(SUM(up.tickets_completed), 0) as total_tickets_completed,
    COUNT(DISTINCT ub.badge_id) as badges_earned,
    RANK() OVER (ORDER BY COALESCE(SUM(up.total_points), 0) DESC) as rank
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
WHERE u.is_active = true
GROUP BY u.id, u.full_name, u.avatar;

-- ============================================
-- DATOS INICIALES (SEEDS)
-- ============================================

-- Insertar badges predefinidos
INSERT INTO gamification_badges (name, description, icon, type, points_reward, criteria) VALUES
('First Blood', 'Completar el primer ticket', '🎯', 'bronze', 10, '{"tickets_completed": 1}'),
('Sprint Champion', 'Completar 10 tickets en un sprint', '🏆', 'silver', 50, '{"tickets_in_sprint": 10}'),
('Bug Hunter', 'Resolver 25 bugs', '🐛', 'silver', 75, '{"bugs_fixed": 25}'),
('Code Ninja', 'Completar 50 tickets', '🥋', 'gold', 150, '{"tickets_completed": 50}'),
('Team Player', 'Revisar 30 pull requests', '🤝', 'gold', 100, '{"reviews_done": 30}'),
('Elite Developer', 'Completar 100 tickets', '💎', 'platinum', 300, '{"tickets_completed": 100}'),
('Legend', 'Alcanzar 1000 puntos', '👑', 'diamond', 500, '{"total_points": 1000}');

-- ============================================
-- FUNCIONES AUXILIARES PARA LA API
-- ============================================

-- Función: Obtener estadísticas de un usuario
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS TABLE(
    total_points BIGINT,
    tickets_completed BIGINT,
    bugs_fixed BIGINT,
    badges_count BIGINT,
    current_rank BIGINT,
    active_tickets BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(up.total_points), 0)::BIGINT as total_points,
        COALESCE(SUM(up.tickets_completed), 0)::BIGINT as tickets_completed,
        COALESCE(SUM(up.bugs_fixed), 0)::BIGINT as bugs_fixed,
        COUNT(DISTINCT ub.badge_id)::BIGINT as badges_count,
        (SELECT rank FROM gamification_leaderboard WHERE user_id = user_uuid)::BIGINT as current_rank,
        COUNT(DISTINCT t.id)::BIGINT as active_tickets
    FROM users u
    LEFT JOIN user_points up ON u.id = up.user_id
    LEFT JOIN user_badges ub ON u.id = ub.user_id
    LEFT JOIN tickets t ON t.assigned_to_id = u.id AND t.status NOT IN ('Done', 'Blocked')
    WHERE u.id = user_uuid
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener tickets con subtickets (recursivo)
CREATE OR REPLACE FUNCTION get_tickets_with_subtasks(parent_uuid UUID)
RETURNS TABLE(
    id UUID,
    ticket_number VARCHAR,
    title VARCHAR,
    status ticket_status,
    level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE ticket_tree AS (
        SELECT t.id, t.ticket_number, t.title, t.status, 0 as level, t.parent_ticket_id
        FROM tickets t
        WHERE t.parent_ticket_id = parent_uuid
        
        UNION ALL
        
        SELECT t.id, t.ticket_number, t.title, t.status, tt.level + 1, t.parent_ticket_id
        FROM tickets t
        INNER JOIN ticket_tree tt ON t.parent_ticket_id = tt.id
    )
    SELECT tt.id, tt.ticket_number, tt.title, tt.status, tt.level
    FROM ticket_tree tt
    ORDER BY tt.level, tt.ticket_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISOS Y SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según necesidades)
-- Los usuarios solo ven proyectos donde son miembros
CREATE POLICY project_member_policy ON projects
    FOR ALL
    USING (
        id IN (
            SELECT project_id 
            FROM project_members 
            WHERE user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE users IS 'Usuarios del sistema con roles y autenticación';
COMMENT ON TABLE projects IS 'Proyectos principales con métricas y estado';
COMMENT ON TABLE sprints IS 'Sprints de cada proyecto, cada uno con su propio backlog';
COMMENT ON TABLE tickets IS 'Tickets/tareas con soporte para subtickets (parent_ticket_id)';
COMMENT ON TABLE milestones IS 'Hitos importantes del proyecto';
COMMENT ON TABLE activity_logs IS 'Registro completo de actividades del sistema';
COMMENT ON TABLE gamification_badges IS 'Definición de badges/insignias del sistema';
COMMENT ON TABLE user_points IS 'Puntos acumulados por usuarios en proyectos';
COMMENT ON TABLE ai_insights IS 'Insights y recomendaciones generadas por IA';
COMMENT ON TABLE burndown_data IS 'Datos históricos para gráficos burndown';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Para verificar que todo se creó correctamente:
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Mostrar todas las funciones creadas:
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
