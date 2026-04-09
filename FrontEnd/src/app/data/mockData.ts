export interface Project {
  id: string;
  name: string;
  progress: number;
  scheduleVariance: number;
  risk: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Delayed' | 'On Track' | 'Completed' | 'Archived';
  delayedMilestones: number;
  milestones: Milestone[];
  progressHistory: ProgressEntry[];
  spi: number;
  blockedTickets: number;
  tickets: Ticket[];
  sprints: SprintDetail[];
  blockers: Blocker[];
  activities: Activity[];
  gamification: ProjectGamification;
  ganttTasks: GanttTask[];
  manager: string;
  team: TeamMember[];
  startDate: string;
  endDate: string;
  closedDate?: string;
  closedBy?: string;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  tasksAssigned: number;
  performance: number;
  status: 'Active' | 'Inactive';
}
export interface Milestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: 'Pending' | 'Completed' | 'Delayed';
}
export interface ProgressEntry {
  date: string;
  planned: number;
  actual: number;
}
export interface Ticket {
  id: string;
  title: string;
  estimation: number;
  assignee: string;
  status: 'Backlog' | 'In Progress' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  sprintId: string;
  startDate: string;
  endDate: string;
  parentTicketId?: string;
  subTickets?: string[];
  description?: string;
}
export interface SprintDetail {
  id: string;
  name: string;
  duration: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  progress: number;
  capacity: number;
  used: number;
  tickets: string[];
  burndownData: {
    day: number;
    remaining: number;
    ideal: number;
  }[];
}
export interface Blocker {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  assignee: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  description: string;
}
export interface Activity {
  id: string;
  type: 'progress' | 'status_change' | 'sprint_created' | 'ticket_closed' | 'blocker_added' | 'ticket_assigned' | 'weekly_performance' | 'project_assigned' | 'sprint_started' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  isPersonal: boolean;
  assignedTo?: string;
}
export interface ProjectGamification {
  projectScore: number;
  topDevelopers: {
    name: string;
    points: number;
    avatar: string;
  }[];
  badges: string[];
}
export interface GanttTask {
  id: string;
  name: string;
  start: number;
  duration: number;
  plannedEnd: number;
  actualEnd?: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  dependencies: string[];
  isCriticalPath: boolean;
}
export const projects: Project[] = [{
  id: '1',
  name: 'E-commerce Platform Redesign',
  progress: 68,
  scheduleVariance: -8,
  risk: 'High',
  status: 'Delayed',
  delayedMilestones: 2,
  spi: 0.82,
  blockedTickets: 1,
  milestones: [{
    id: 'm1',
    name: 'Requirements Analysis',
    plannedDate: '2026-01-15',
    actualDate: '2026-01-18',
    status: 'Completed'
  }, {
    id: 'm2',
    name: 'Design System',
    plannedDate: '2026-02-10',
    actualDate: '2026-02-15',
    status: 'Completed'
  }, {
    id: 'm3',
    name: 'Backend Development',
    plannedDate: '2026-03-20',
    status: 'Delayed'
  }, {
    id: 'm4',
    name: 'Frontend Development',
    plannedDate: '2026-04-10',
    status: 'Pending'
  }, {
    id: 'm5',
    name: 'Testing & QA',
    plannedDate: '2026-05-01',
    status: 'Pending'
  }],
  progressHistory: [{
    date: '2026-01-01',
    planned: 10,
    actual: 8
  }, {
    date: '2026-01-15',
    planned: 25,
    actual: 20
  }, {
    date: '2026-02-01',
    planned: 40,
    actual: 35
  }, {
    date: '2026-02-15',
    planned: 55,
    actual: 50
  }, {
    date: '2026-03-01',
    planned: 70,
    actual: 60
  }, {
    date: '2026-03-15',
    planned: 85,
    actual: 68
  }],
  tickets: [{
    id: 't6',
    title: 'Implement user reviews',
    estimation: 5,
    assignee: 'Juan Developer',
    status: 'Done',
    priority: 'Medium',
    sprintId: 'ps0',
    startDate: '2026-01-20',
    endDate: '2026-01-24'
  }, {
    id: 't8',
    title: 'Setup authentication system',
    estimation: 8,
    assignee: 'Carlos M.',
    status: 'Done',
    priority: 'High',
    sprintId: 'ps0',
    startDate: '2026-01-20',
    endDate: '2026-01-28'
  }, {
    id: 't9',
    title: 'Create landing page',
    estimation: 5,
    assignee: 'Ana R.',
    status: 'Done',
    priority: 'Medium',
    sprintId: 'ps0',
    startDate: '2026-01-22',
    endDate: '2026-01-26'
  }, {
    id: 't10',
    title: 'Implement user profile',
    estimation: 3,
    assignee: 'Luis F.',
    status: 'Done',
    priority: 'Low',
    sprintId: 'ps0',
    startDate: '2026-01-25',
    endDate: '2026-01-28'
  }, {
    id: 't11',
    title: 'Add email notifications',
    estimation: 3,
    assignee: 'Diego M.',
    status: 'Done',
    priority: 'Medium',
    sprintId: 'ps0',
    startDate: '2026-01-28',
    endDate: '2026-01-31'
  }, {
    id: 't1',
    title: 'Implement payment gateway',
    estimation: 8,
    assignee: 'Juan Developer',
    status: 'In Progress',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-03',
    endDate: '2026-02-10'
  }, {
    id: 't2',
    title: 'Design product catalog',
    estimation: 5,
    assignee: 'Ana R.',
    status: 'Done',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-03',
    endDate: '2026-02-05'
  }, {
    id: 't3',
    title: 'Optimize search functionality',
    estimation: 5,
    assignee: 'Luis F.',
    status: 'In Progress',
    priority: 'Medium',
    sprintId: 'ps1',
    startDate: '2026-02-05',
    endDate: '2026-02-09'
  }, {
    id: 't4',
    title: 'Add wishlist feature',
    estimation: 3,
    assignee: 'Juan Developer',
    status: 'Backlog',
    priority: 'Low',
    sprintId: 'ps1',
    startDate: '2026-02-10',
    endDate: '2026-02-12'
  }, {
    id: 't5',
    title: 'Fix checkout bug',
    estimation: 2,
    assignee: 'Diego M.',
    status: 'Blocked',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-06',
    endDate: '2026-02-07'
  }, {
    id: 't7',
    title: 'Create API documentation',
    estimation: 3,
    assignee: 'Juan Developer',
    status: 'In Progress',
    priority: 'Medium',
    sprintId: 'ps1',
    startDate: '2026-02-08',
    endDate: '2026-02-10'
  }, {
    id: 't12',
    title: 'Setup CI/CD pipeline',
    estimation: 5,
    assignee: 'Carlos M.',
    status: 'Done',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-03',
    endDate: '2026-02-07'
  }, {
    id: 't13',
    title: 'Implement shopping cart',
    estimation: 8,
    assignee: 'Juan Developer',
    status: 'In Progress',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-04',
    endDate: '2026-02-11',
    subTickets: ['t13-sub1', 't13-sub2', 't13-sub3'],
    description: 'Historia de usuario: Como usuario quiero gestionar mi carrito de compras'
  }, {
    id: 't13-sub1',
    title: 'Create cart UI components',
    estimation: 3,
    assignee: 'Juan Developer',
    status: 'Done',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-04',
    endDate: '2026-02-06',
    parentTicketId: 't13',
    description: 'Crear componentes visuales del carrito'
  }, {
    id: 't13-sub2',
    title: 'Implement cart state management',
    estimation: 3,
    assignee: 'Juan Developer',
    status: 'In Progress',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-06',
    endDate: '2026-02-09',
    parentTicketId: 't13',
    description: 'Implementar Redux/Context para manejo de estado del carrito'
  }, {
    id: 't13-sub3',
    title: 'Add cart persistence',
    estimation: 2,
    assignee: 'Juan Developer',
    status: 'Backlog',
    priority: 'High',
    sprintId: 'ps1',
    startDate: '2026-02-09',
    endDate: '2026-02-11',
    parentTicketId: 't13',
    description: 'Guardar carrito en localStorage'
  }, {
    id: 't14',
    title: 'Add product filters',
    estimation: 5,
    assignee: 'Patricia T.',
    status: 'Backlog',
    priority: 'Medium',
    sprintId: 'ps1',
    startDate: '2026-02-09',
    endDate: '2026-02-13'
  }, {
    id: 't15',
    title: 'Create admin dashboard',
    estimation: 8,
    assignee: 'Carlos M.',
    status: 'Backlog',
    priority: 'Medium',
    sprintId: 'ps1',
    startDate: '2026-02-10',
    endDate: '2026-02-17'
  }, {
    id: 't16',
    title: 'Implement order tracking',
    estimation: 5,
    assignee: 'Luis F.',
    status: 'Backlog',
    priority: 'Low',
    sprintId: 'ps1',
    startDate: '2026-02-12',
    endDate: '2026-02-16'
  }, {
    id: 't17',
    title: 'Add social login',
    estimation: 3,
    assignee: 'Ana R.',
    status: 'Backlog',
    priority: 'Low',
    sprintId: 'ps1',
    startDate: '2026-02-13',
    endDate: '2026-02-15'
  }, {
    id: 't18',
    title: 'Optimize images',
    estimation: 2,
    assignee: 'Diego M.',
    status: 'Backlog',
    priority: 'Low',
    sprintId: 'ps1',
    startDate: '2026-02-14',
    endDate: '2026-02-15'
  }, {
    id: 't19',
    title: 'Setup analytics',
    estimation: 3,
    assignee: 'Patricia T.',
    status: 'Backlog',
    priority: 'Medium',
    sprintId: 'ps1',
    startDate: '2026-02-15',
    endDate: '2026-02-17'
  }],
  sprints: [{
    id: 'ps0',
    name: 'Sprint 11',
    duration: 'Jan 20 - Feb 3',
    status: 'Completed',
    progress: 100,
    capacity: 35,
    used: 35,
    tickets: ['t6', 't8', 't9', 't10', 't11'],
    burndownData: [{
      day: 1,
      remaining: 35,
      ideal: 35
    }, {
      day: 2,
      remaining: 32,
      ideal: 32.5
    }, {
      day: 3,
      remaining: 28,
      ideal: 30
    }, {
      day: 4,
      remaining: 24,
      ideal: 27.5
    }, {
      day: 5,
      remaining: 20,
      ideal: 25
    }, {
      day: 6,
      remaining: 16,
      ideal: 22.5
    }, {
      day: 7,
      remaining: 12,
      ideal: 20
    }, {
      day: 8,
      remaining: 8,
      ideal: 17.5
    }, {
      day: 9,
      remaining: 4,
      ideal: 15
    }, {
      day: 10,
      remaining: 0,
      ideal: 0
    }]
  }, {
    id: 'ps1',
    name: 'Sprint 12',
    duration: 'Feb 3 - Feb 17',
    status: 'Active',
    progress: 65,
    capacity: 40,
    used: 26,
    tickets: ['t1', 't2', 't3', 't4', 't5', 't7', 't12', 't13', 't14', 't15', 't16', 't17', 't18', 't19'],
    burndownData: [{
      day: 1,
      remaining: 26,
      ideal: 26
    }, {
      day: 2,
      remaining: 24,
      ideal: 23.7
    }, {
      day: 3,
      remaining: 22,
      ideal: 21.4
    }, {
      day: 4,
      remaining: 20,
      ideal: 19.1
    }, {
      day: 5,
      remaining: 18,
      ideal: 16.8
    }, {
      day: 6,
      remaining: 15,
      ideal: 14.5
    }, {
      day: 7,
      remaining: 13,
      ideal: 12.2
    }, {
      day: 8,
      remaining: 10,
      ideal: 9.9
    }, {
      day: 9,
      remaining: 9,
      ideal: 7.6
    }, {
      day: 10,
      remaining: 7,
      ideal: 5.3
    }]
  }],
  blockers: [{
    id: 'b1',
    title: 'API rate limit exceeded',
    severity: 'High',
    assignee: 'Carlos M.',
    status: 'In Progress',
    description: 'Third-party payment API hitting rate limits during peak hours'
  }, {
    id: 'b2',
    title: 'Missing design assets',
    severity: 'Medium',
    assignee: 'Ana R.',
    status: 'Open',
    description: 'Product images for new categories not yet provided by client'
  }, {
    id: 'b3',
    title: 'Database migration pending',
    severity: 'High',
    assignee: 'Luis F.',
    status: 'Open',
    description: 'Waiting for DevOps approval to run migration scripts'
  }],
  activities: [{
    id: 'a1',
    type: 'ticket_closed',
    title: 'Ticket cerrado',
    description: 'Design product catalog completado',
    timestamp: '2026-02-16 14:30',
    user: 'Ana R.',
    isPersonal: false
  }, {
    id: 'a2',
    type: 'blocker_added',
    title: 'Bloqueador agregado',
    description: 'API rate limit exceeded reportado',
    timestamp: '2026-02-16 10:15',
    user: 'Carlos M.',
    isPersonal: false
  }, {
    id: 'a3',
    type: 'progress',
    title: 'Avance registrado',
    description: 'Proyecto avanzó de 65% a 68%',
    timestamp: '2026-02-15 16:45',
    user: 'Project Manager',
    isPersonal: false
  }, {
    id: 'a4',
    type: 'status_change',
    title: 'Estado actualizado',
    description: 'Sprint 12 cambió a En Progreso',
    timestamp: '2026-02-14 09:00',
    user: 'System',
    isPersonal: false
  }, {
    id: 'a5',
    type: 'sprint_created',
    title: 'Sprint creado',
    description: 'Sprint 12 creado para E-commerce',
    timestamp: '2026-02-13 11:20',
    user: 'Project Manager',
    isPersonal: false
  }, {
    id: 'a6',
    type: 'ticket_assigned',
    title: 'Ticket asignado',
    description: 'Se te asignó "Implement payment gateway"',
    timestamp: '2026-02-24 09:30',
    user: 'Carlos M.',
    isPersonal: true,
    assignedTo: 'Carlos M.'
  }, {
    id: 'a7',
    type: 'weekly_performance',
    title: 'Reporte Semanal',
    description: 'Completaste 8 tickets esta semana. ¡Excelente trabajo! +450 puntos',
    timestamp: '2026-02-23 18:00',
    user: 'Carlos M.',
    isPersonal: true,
    assignedTo: 'Carlos M.'
  }, {
    id: 'a8',
    type: 'project_assigned',
    title: 'Proyecto asignado',
    description: 'Fuiste agregado al proyecto E-commerce Platform',
    timestamp: '2026-02-20 10:00',
    user: 'Carlos M.',
    isPersonal: true,
    assignedTo: 'Carlos M.'
  }, {
    id: 'a9',
    type: 'sprint_started',
    title: 'Sprint iniciado',
    description: 'Sprint 2 - Core Features ha comenzado. Tienes 5 tickets asignados',
    timestamp: '2026-02-17 09:00',
    user: 'Carlos M.',
    isPersonal: true,
    assignedTo: 'Carlos M.'
  }, {
    id: 'a10',
    type: 'achievement_unlocked',
    title: '¡Logro desbloqueado!',
    description: 'Has ganado el badge "Speed Demon" por completar 3 tickets en un día',
    timestamp: '2026-02-15 17:00',
    user: 'Carlos M.',
    isPersonal: true,
    assignedTo: 'Carlos M.'
  }],
  gamification: {
    projectScore: 7850,
    topDevelopers: [{
      name: 'Carlos M.',
      points: 1850,
      avatar: 'CM'
    }, {
      name: 'Ana R.',
      points: 1720,
      avatar: 'AR'
    }, {
      name: 'Luis F.',
      points: 1580,
      avatar: 'LF'
    }],
    badges: ['Sprint Master', 'Bug Hunter', 'Fast Delivery']
  },
  ganttTasks: [{
    id: 'g1',
    name: 'Requirements',
    start: 0,
    duration: 15,
    plannedEnd: 15,
    actualEnd: 18,
    status: 'Completed',
    dependencies: [],
    isCriticalPath: true
  }, {
    id: 'g2',
    name: 'Design System',
    start: 15,
    duration: 25,
    plannedEnd: 40,
    actualEnd: 45,
    status: 'Completed',
    dependencies: ['g1'],
    isCriticalPath: true
  }, {
    id: 'g3',
    name: 'Backend Dev',
    start: 40,
    duration: 30,
    plannedEnd: 70,
    status: 'Delayed',
    dependencies: ['g2'],
    isCriticalPath: true
  }, {
    id: 'g4',
    name: 'Frontend Dev',
    start: 60,
    duration: 20,
    plannedEnd: 80,
    status: 'Pending',
    dependencies: ['g2'],
    isCriticalPath: false
  }, {
    id: 'g5',
    name: 'Testing',
    start: 80,
    duration: 10,
    plannedEnd: 90,
    status: 'Pending',
    dependencies: ['g3', 'g4'],
    isCriticalPath: true
  }],
  manager: 'María González',
  team: [{
    id: 'tm1',
    name: 'Carlos M.',
    role: 'Developer',
    email: 'carlos.mendoza@example.com',
    avatar: 'CM',
    tasksAssigned: 0,
    performance: 90,
    status: 'Active'
  }, {
    id: 'tm2',
    name: 'Ana R.',
    role: 'Designer',
    email: 'ana.rodriguez@example.com',
    avatar: 'AR',
    tasksAssigned: 1,
    performance: 85,
    status: 'Active'
  }, {
    id: 'tm3',
    name: 'Luis F.',
    role: 'Developer',
    email: 'luis.fernandez@example.com',
    avatar: 'LF',
    tasksAssigned: 1,
    performance: 80,
    status: 'Active'
  }, {
    id: 'tm4',
    name: 'Patricia T.',
    role: 'Developer',
    email: 'patricia.torres@example.com',
    avatar: 'PT',
    tasksAssigned: 0,
    performance: 75,
    status: 'Active'
  }, {
    id: 'tm5',
    name: 'Diego M.',
    role: 'Developer',
    email: 'diego.martinez@example.com',
    avatar: 'DM',
    tasksAssigned: 1,
    performance: 70,
    status: 'Active'
  }, {
    id: 'dev-1',
    name: 'Juan Developer',
    role: 'Full Stack Developer',
    email: 'juan.dev@taskhub.com',
    avatar: 'JD',
    tasksAssigned: 4,
    performance: 92,
    status: 'Active'
  }],
  startDate: '2026-01-01',
  endDate: '2026-05-31'
}, {
  id: '2',
  name: 'Mobile App Development',
  progress: 45,
  scheduleVariance: 5,
  risk: 'Low',
  status: 'On Track',
  delayedMilestones: 0,
  spi: 1.05,
  blockedTickets: 0,
  milestones: [{
    id: 'm1',
    name: 'Project Kickoff',
    plannedDate: '2026-01-05',
    actualDate: '2026-01-05',
    status: 'Completed'
  }, {
    id: 'm2',
    name: 'UI/UX Design',
    plannedDate: '2026-02-01',
    actualDate: '2026-01-28',
    status: 'Completed'
  }, {
    id: 'm3',
    name: 'Core Features',
    plannedDate: '2026-03-15',
    status: 'Pending'
  }, {
    id: 'm4',
    name: 'Beta Release',
    plannedDate: '2026-04-20',
    status: 'Pending'
  }],
  progressHistory: [{
    date: '2026-01-01',
    planned: 5,
    actual: 5
  }, {
    date: '2026-01-15',
    planned: 15,
    actual: 18
  }, {
    date: '2026-02-01',
    planned: 30,
    actual: 32
  }, {
    date: '2026-02-15',
    planned: 45,
    actual: 45
  }],
  tickets: [{
    id: 't7',
    title: 'User authentication flow',
    estimation: 8,
    assignee: 'Maria S.',
    status: 'In Progress',
    priority: 'High',
    sprintId: 'ps2',
    startDate: '2026-02-03',
    endDate: '2026-02-10'
  }, {
    id: 't8',
    title: 'Profile management',
    estimation: 5,
    assignee: 'Juan P.',
    status: 'Backlog',
    priority: 'Medium',
    sprintId: 'ps2',
    startDate: '2026-02-10',
    endDate: '2026-02-14'
  }],
  sprints: [{
    id: 'ps2',
    name: 'Sprint 8',
    duration: 'Feb 3 - Feb 17',
    status: 'Active',
    progress: 72,
    capacity: 30,
    used: 22,
    tickets: ['t7', 't8'],
    burndownData: [{
      day: 1,
      remaining: 22,
      ideal: 22
    }, {
      day: 2,
      remaining: 20,
      ideal: 20
    }, {
      day: 3,
      remaining: 18,
      ideal: 18
    }, {
      day: 4,
      remaining: 15,
      ideal: 16
    }, {
      day: 5,
      remaining: 13,
      ideal: 14
    }]
  }],
  blockers: [],
  activities: [{
    id: 'a6',
    type: 'progress',
    title: 'Avance registrado',
    description: 'Proyecto avanzó a 45%',
    timestamp: '2026-02-15 10:00',
    user: 'Project Manager',
    isPersonal: false
  }],
  gamification: {
    projectScore: 5200,
    topDevelopers: [{
      name: 'Maria S.',
      points: 1200,
      avatar: 'MS'
    }, {
      name: 'Juan P.',
      points: 980,
      avatar: 'JP'
    }],
    badges: ['Fast Start', 'Quality First']
  },
  ganttTasks: [{
    id: 'g6',
    name: 'Kickoff',
    start: 0,
    duration: 5,
    plannedEnd: 5,
    actualEnd: 5,
    status: 'Completed',
    dependencies: [],
    isCriticalPath: true
  }, {
    id: 'g7',
    name: 'Design',
    start: 5,
    duration: 20,
    plannedEnd: 25,
    actualEnd: 23,
    status: 'Completed',
    dependencies: ['g6'],
    isCriticalPath: true
  }, {
    id: 'g8',
    name: 'Development',
    start: 25,
    duration: 30,
    plannedEnd: 55,
    status: 'In Progress',
    dependencies: ['g7'],
    isCriticalPath: true
  }],
  manager: 'Project Manager',
  team: [{
    id: 'tm6',
    name: 'Maria S.',
    role: 'Developer',
    email: 'maria.sanchez@example.com',
    avatar: 'MS',
    tasksAssigned: 4,
    performance: 85,
    status: 'Active'
  }, {
    id: 'tm7',
    name: 'Juan P.',
    role: 'Developer',
    email: 'juan.perez@example.com',
    avatar: 'JP',
    tasksAssigned: 3,
    performance: 80,
    status: 'Active'
  }],
  startDate: '2026-01-01',
  endDate: '2026-04-30'
}, {
  id: '3',
  name: 'CRM Integration System',
  progress: 82,
  scheduleVariance: 12,
  risk: 'Medium',
  status: 'Active',
  delayedMilestones: 1,
  spi: 0.95,
  blockedTickets: 1,
  milestones: [{
    id: 'm1',
    name: 'Requirements Gathering',
    plannedDate: '2025-11-15',
    actualDate: '2025-11-15',
    status: 'Completed'
  }, {
    id: 'm2',
    name: 'API Development',
    plannedDate: '2025-12-20',
    actualDate: '2025-12-18',
    status: 'Completed'
  }, {
    id: 'm3',
    name: 'Integration Testing',
    plannedDate: '2026-01-30',
    actualDate: '2026-02-05',
    status: 'Completed'
  }, {
    id: 'm4',
    name: 'Deployment',
    plannedDate: '2026-02-20',
    status: 'Pending'
  }],
  progressHistory: [{
    date: '2025-11-01',
    planned: 15,
    actual: 15
  }, {
    date: '2025-12-01',
    planned: 35,
    actual: 40
  }, {
    date: '2026-01-01',
    planned: 60,
    actual: 65
  }, {
    date: '2026-02-01',
    planned: 80,
    actual: 82
  }],
  tickets: [{
    id: 't9',
    title: 'CRM API integration',
    estimation: 13,
    assignee: 'Roberto L.',
    status: 'Done',
    priority: 'High',
    sprintId: 'ps3',
    startDate: '2026-02-10',
    endDate: '2026-02-24'
  }, {
    id: 't10',
    title: 'Data migration script',
    estimation: 8,
    assignee: 'Sofia G.',
    status: 'Blocked',
    priority: 'High',
    sprintId: 'ps3',
    startDate: '2026-02-12',
    endDate: '2026-02-19'
  }],
  sprints: [{
    id: 'ps3',
    name: 'Sprint 15',
    duration: 'Feb 10 - Feb 24',
    status: 'Active',
    progress: 45,
    capacity: 35,
    used: 21,
    tickets: ['t9', 't10'],
    burndownData: [{
      day: 1,
      remaining: 21,
      ideal: 21
    }, {
      day: 2,
      remaining: 19,
      ideal: 19
    }, {
      day: 3,
      remaining: 17,
      ideal: 17
    }]
  }],
  blockers: [{
    id: 'b4',
    title: 'Legacy system access',
    severity: 'High',
    assignee: 'Roberto L.',
    status: 'Open',
    description: 'Waiting for client to provide VPN credentials'
  }],
  activities: [{
    id: 'a7',
    type: 'ticket_closed',
    title: 'Ticket cerrado',
    description: 'CRM API integration completado',
    timestamp: '2026-02-16 12:00',
    user: 'Roberto L.',
    isPersonal: false
  }],
  gamification: {
    projectScore: 9100,
    topDevelopers: [{
      name: 'Roberto L.',
      points: 2100,
      avatar: 'RL'
    }, {
      name: 'Sofia G.',
      points: 1850,
      avatar: 'SG'
    }],
    badges: ['Integration Expert', 'Sprint Master']
  },
  ganttTasks: [{
    id: 'g9',
    name: 'Requirements',
    start: 0,
    duration: 15,
    plannedEnd: 15,
    actualEnd: 15,
    status: 'Completed',
    dependencies: [],
    isCriticalPath: true
  }, {
    id: 'g10',
    name: 'API Dev',
    start: 15,
    duration: 30,
    plannedEnd: 45,
    actualEnd: 43,
    status: 'Completed',
    dependencies: ['g9'],
    isCriticalPath: true
  }, {
    id: 'g11',
    name: 'Testing',
    start: 45,
    duration: 20,
    plannedEnd: 65,
    actualEnd: 70,
    status: 'Completed',
    dependencies: ['g10'],
    isCriticalPath: true
  }, {
    id: 'g12',
    name: 'Deployment',
    start: 70,
    duration: 10,
    plannedEnd: 80,
    status: 'Pending',
    dependencies: ['g11'],
    isCriticalPath: true
  }],
  manager: 'Project Manager',
  team: [{
    id: 'tm8',
    name: 'Roberto L.',
    role: 'Developer',
    email: 'roberto.lopez@example.com',
    avatar: 'RL',
    tasksAssigned: 5,
    performance: 90,
    status: 'Active'
  }, {
    id: 'tm9',
    name: 'Sofia G.',
    role: 'Developer',
    email: 'sofia.garcia@example.com',
    avatar: 'SG',
    tasksAssigned: 4,
    performance: 85,
    status: 'Active'
  }],
  startDate: '2025-11-01',
  endDate: '2026-02-28'
}];
export const sprints: Sprint[] = [{
  id: 's1',
  name: 'Sprint 12 - E-commerce',
  duration: '2 weeks (Feb 3 - Feb 17)',
  status: 'Active',
  progress: 65,
  capacity: 80,
  used: 52
}, {
  id: 's2',
  name: 'Sprint 8 - Mobile App',
  duration: '2 weeks (Feb 3 - Feb 17)',
  status: 'Active',
  progress: 72,
  capacity: 60,
  used: 43
}, {
  id: 's3',
  name: 'Sprint 15 - CRM System',
  duration: '2 weeks (Feb 10 - Feb 24)',
  status: 'Upcoming',
  progress: 0,
  capacity: 70,
  used: 0
}, {
  id: 's4',
  name: 'Sprint 11 - E-commerce',
  duration: '2 weeks (Jan 20 - Feb 3)',
  status: 'Completed',
  progress: 100,
  capacity: 80,
  used: 78
}];
export const developers: Developer[] = [{
  id: 'd1',
  name: 'Carlos Mendoza',
  avatar: 'CM',
  points: 2850,
  badges: ['Sprint Master', 'Bug Hunter', 'Code Reviewer'],
  rank: 1
}, {
  id: 'd2',
  name: 'Ana Rodríguez',
  avatar: 'AR',
  points: 2720,
  badges: ['Sprint Master', 'Innovation Champion'],
  rank: 2
}, {
  id: 'd3',
  name: 'Luis Fernández',
  avatar: 'LF',
  points: 2580,
  badges: ['Bug Hunter', 'Team Player'],
  rank: 3
}, {
  id: 'd4',
  name: 'Patricia Torres',
  avatar: 'PT',
  points: 2410,
  badges: ['Code Reviewer', 'Sprint Master'],
  rank: 4
}, {
  id: 'd5',
  name: 'Diego Martínez',
  avatar: 'DM',
  points: 2290,
  badges: ['Bug Hunter'],
  rank: 5
}];
export const globalMetrics = {
  overallProgress: 65,
  avgScheduleVariance: -2.5,
  delayedMilestones: 3,
  overallRisk: 'Medium' as const
};
export const globalGamification = {
  totalScore: 22150,
  topDevelopers: [{
    name: 'Carlos Mendoza',
    points: 2850,
    avatar: 'CM'
  }, {
    name: 'Ana Rodríguez',
    points: 2720,
    avatar: 'AR'
  }, {
    name: 'Luis Fernández',
    points: 2580,
    avatar: 'LF'
  }, {
    name: 'Patricia Torres',
    points: 2410,
    avatar: 'PT'
  }, {
    name: 'Diego Martínez',
    points: 2290,
    avatar: 'DM'
  }],
  badges: ['Sprint Master', 'Bug Hunter', 'Fast Delivery', 'Integration Expert', 'Quality First', 'Code Reviewer']
};
export interface GlobalNotification {
  id: string;
  type: 'ticket_completed' | 'blocker_added' | 'achievement' | 'ai_alert' | 'deadline' | 'ticket_assigned' | 'weekly_performance' | 'project_assigned' | 'sprint_started';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  read: boolean;
  projectName?: string;
  isPersonal: boolean;
  assignedTo?: string;
}
export const globalNotifications: GlobalNotification[] = [{
  id: 'gn1',
  type: 'ticket_completed',
  title: 'Ticket completado',
  description: 'Ana Rodríguez completó "Design product catalog"',
  user: 'Ana Rodríguez',
  timestamp: 'Hace 15 min',
  read: false,
  projectName: 'E-commerce Platform',
  isPersonal: false
}, {
  id: 'gn2',
  type: 'blocker_added',
  title: 'Nuevo bloqueador',
  description: 'Luis Fernández reportó un bloqueador crítico',
  user: 'Luis Fernández',
  timestamp: 'Hace 30 min',
  read: false,
  projectName: 'E-commerce Platform',
  isPersonal: false
}, {
  id: 'gn3',
  type: 'achievement',
  title: 'Nuevo logro',
  description: 'El equipo alcanzó "Sprint Master"',
  user: 'Sistema',
  timestamp: 'Hace 1 hora',
  read: true,
  projectName: 'Mobile App Development',
  isPersonal: false
}, {
  id: 'gn4',
  type: 'ticket_assigned',
  title: 'Ticket asignado',
  description: 'Se te asignó "Implement payment gateway" en Sprint 12',
  user: 'Carlos Mendoza',
  timestamp: 'Hace 2 horas',
  read: false,
  projectName: 'E-commerce Platform',
  isPersonal: true,
  assignedTo: 'Carlos Mendoza'
}, {
  id: 'gn5',
  type: 'ticket_completed',
  title: 'Ticket completado',
  description: 'Completaste "Setup CI/CD pipeline" - ¡Gran trabajo!',
  user: 'Carlos Mendoza',
  timestamp: 'Hace 5 horas',
  read: false,
  projectName: 'E-commerce Platform',
  isPersonal: true,
  assignedTo: 'Carlos Mendoza'
}, {
  id: 'gn6',
  type: 'weekly_performance',
  title: 'Reporte Semanal',
  description: 'Completaste 8 tickets esta semana. ¡Excelente trabajo! +450 puntos',
  user: 'Sistema',
  timestamp: 'Hace 1 día',
  read: true,
  projectName: 'Global',
  isPersonal: true,
  assignedTo: 'Carlos Mendoza'
}, {
  id: 'gn7',
  type: 'achievement',
  title: '¡Logro desbloqueado!',
  description: 'Has ganado el badge "Speed Demon" por completar 3 tickets en un día',
  user: 'Sistema',
  timestamp: 'Hace 2 días',
  read: true,
  projectName: 'Global',
  isPersonal: true,
  assignedTo: 'Carlos Mendoza'
}, {
  id: 'gn8',
  type: 'sprint_started',
  title: 'Sprint iniciado',
  description: 'Sprint 12 ha comenzado. Tienes 5 tickets asignados',
  user: 'Sistema',
  timestamp: 'Hace 3 días',
  read: true,
  projectName: 'E-commerce Platform',
  isPersonal: true,
  assignedTo: 'Carlos Mendoza'
}, {
  id: 'gn9',
  type: 'deadline',
  title: 'Deadline próximo',
  description: 'El ticket "Implement shopping cart" vence mañana',
  user: 'Sistema',
  timestamp: 'Hace 4 horas',
  read: false,
  projectName: 'E-commerce Platform',
  isPersonal: true,
  assignedTo: 'Carlos Mendoza'
}, {
  id: 'gn10',
  type: 'ticket_assigned',
  title: 'Ticket asignado',
  description: 'Se te asignó "Add wishlist feature" en Sprint 12',
  user: 'Juan Developer',
  timestamp: 'Hace 3 horas',
  read: false,
  projectName: 'E-commerce Platform',
  isPersonal: true,
  assignedTo: 'Juan Developer'
}];
export interface DeveloperMetrics {
  developerName: string;
  projectId: string;
  totalTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  blockedTickets: number;
  completionRate: number;
  personalVelocity: number;
  avgResolutionTime: number;
  currentStreak: number;
  bestStreak: number;
  bugRate: number;
  codeReviews: number;
  averageTaskSize: number;
  rankInTeam: number;
  totalDevelopers: number;
  percentile: number;
  currentSprintTickets: number;
  currentSprintCompleted: number;
  currentSprintProgress: number;
  sprintHistory: {
    sprintId: string;
    sprintName: string;
    ticketsCompleted: number;
    points: number;
    velocity: number;
  }[];
}
export const developerMetrics: Record<string, DeveloperMetrics> = {
  'Carlos Mendoza': {
    developerName: 'Carlos Mendoza',
    projectId: 'e-commerce-platform',
    totalTickets: 47,
    completedTickets: 42,
    inProgressTickets: 3,
    blockedTickets: 2,
    completionRate: 89.4,
    personalVelocity: 28,
    avgResolutionTime: 2.3,
    currentStreak: 8,
    bestStreak: 12,
    bugRate: 4.2,
    codeReviews: 23,
    averageTaskSize: 5.2,
    rankInTeam: 1,
    totalDevelopers: 8,
    percentile: 95,
    currentSprintTickets: 5,
    currentSprintCompleted: 2,
    currentSprintProgress: 40,
    sprintHistory: [{
      sprintId: 'sprint-12',
      sprintName: 'Sprint 12',
      ticketsCompleted: 2,
      points: 13,
      velocity: 28
    }, {
      sprintId: 'sprint-11',
      sprintName: 'Sprint 11',
      ticketsCompleted: 7,
      points: 32,
      velocity: 32
    }, {
      sprintId: 'sprint-10',
      sprintName: 'Sprint 10',
      ticketsCompleted: 6,
      points: 28,
      velocity: 28
    }, {
      sprintId: 'sprint-9',
      sprintName: 'Sprint 9',
      ticketsCompleted: 8,
      points: 35,
      velocity: 35
    }, {
      sprintId: 'sprint-8',
      sprintName: 'Sprint 8',
      ticketsCompleted: 5,
      points: 21,
      velocity: 21
    }]
  },
  'Juan Developer': {
    developerName: 'Juan Developer',
    projectId: 'e-commerce-platform',
    totalTickets: 38,
    completedTickets: 32,
    inProgressTickets: 4,
    blockedTickets: 2,
    completionRate: 84.2,
    personalVelocity: 22,
    avgResolutionTime: 2.8,
    currentStreak: 5,
    bestStreak: 9,
    bugRate: 6.1,
    codeReviews: 18,
    averageTaskSize: 4.8,
    rankInTeam: 3,
    totalDevelopers: 8,
    percentile: 75,
    currentSprintTickets: 4,
    currentSprintCompleted: 1,
    currentSprintProgress: 25,
    sprintHistory: [{
      sprintId: 'sprint-12',
      sprintName: 'Sprint 12',
      ticketsCompleted: 1,
      points: 8,
      velocity: 22
    }, {
      sprintId: 'sprint-11',
      sprintName: 'Sprint 11',
      ticketsCompleted: 5,
      points: 24,
      velocity: 24
    }, {
      sprintId: 'sprint-10',
      sprintName: 'Sprint 10',
      ticketsCompleted: 6,
      points: 26,
      velocity: 26
    }, {
      sprintId: 'sprint-9',
      sprintName: 'Sprint 9',
      ticketsCompleted: 5,
      points: 19,
      velocity: 19
    }, {
      sprintId: 'sprint-8',
      sprintName: 'Sprint 8',
      ticketsCompleted: 4,
      points: 18,
      velocity: 18
    }]
  }
};