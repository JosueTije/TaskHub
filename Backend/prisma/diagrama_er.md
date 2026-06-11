# Diagrama Entidad-Relación — TaskHub

```mermaid
erDiagram

    User {
        string id PK
        string email UK
        string passwordHash
        string fullName
        string avatarUrl
        string role
        string status
        boolean mustChangePassword
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    UserOtp {
        string id PK
        string userId FK
        string type
        string codeHash
        datetime expiresAt
        datetime usedAt
        datetime createdAt
    }

    Project {
        string id PK
        string name
        string description
        string code UK
        string status
        string riskLevel
        string createdById FK
        string pmId FK
        datetime startDate
        datetime targetEndDate
        datetime actualEndDate
        float budget
        string githubRepo
        string githubRepoUrl
        datetime createdAt
        datetime updatedAt
        datetime archivedAt
    }

    ProjectMember {
        string id PK
        string projectId FK
        string userId FK
        datetime joinedAt
        datetime leftAt
        datetime createdAt
    }

    Sprint {
        string id PK
        string projectId FK
        string name
        string goal
        string status
        int capacity
        datetime startDate
        datetime endDate
        datetime completedAt
        string githubBranch
        datetime createdAt
        datetime updatedAt
    }

    Ticket {
        string id PK
        string projectId FK
        string sprintId FK
        string parentTicketId FK
        string title
        string description
        string status
        string priority
        int storyPoints
        string assignedToId FK
        string createdById FK
        datetime startDate
        datetime dueDate
        datetime startedAt
        datetime completedAt
        float estimatedHours
        float actualHours
        string githubBranch
        int githubPrNumber
        string githubPrUrl
        string githubPrStatus
        datetime createdAt
        datetime updatedAt
    }

    GamificationEvent {
        string id PK
        string ticketId UK
        string userId
        string projectId
        int points
        string priority
        int storyPoints
        float estimatedHours
        float actualHours
        boolean precision
        datetime createdAt
    }

    ActivityLog {
        string id PK
        string projectId
        string userId
        string userFullName
        string entityType
        string entityId
        string entityTitle
        string action
        string metadata
        datetime createdAt
    }

    Notification {
        string id PK
        string userId FK
        string type
        string title
        string description
        string projectName
        boolean read
        datetime createdAt
    }

    User ||--o{ UserOtp          : "tiene"
    User ||--o{ Project          : "crea"
    User ||--o{ Project          : "gestiona como PM"
    User ||--o{ ProjectMember    : "pertenece"
    User ||--o{ Ticket           : "asignado"
    User ||--o{ Ticket           : "creado por"
    User ||--o{ Notification     : "recibe"

    Project ||--o{ ProjectMember : "tiene miembros"
    Project ||--o{ Sprint        : "tiene sprints"
    Project ||--o{ Ticket        : "contiene tickets"

    Sprint ||--o{ Ticket : "agrupa"

    Ticket ||--o{ Ticket            : "subtareas"
    Ticket ||--o| GamificationEvent : "genera puntos"
```

---

## Relaciones clave

| Relación | Tipo | Descripción |
|---|---|---|
| User → Project (createdBy) | 1:N | Un usuario puede crear muchos proyectos |
| User → Project (pm) | 1:N | Un usuario puede ser PM de varios proyectos |
| User ↔ Project | N:M (via ProjectMember) | Membresía con fecha de entrada/salida |
| Project → Sprint | 1:N | Un proyecto tiene múltiples sprints |
| Sprint → Ticket | 1:N | Un sprint contiene múltiples tickets |
| Ticket → Ticket | 1:N (auto) | Subtareas dentro de un ticket |
| Ticket → GamificationEvent | 1:1 | Un ticket completado genera un único evento de puntos |
| User → Notification | 1:N | Un usuario recibe múltiples notificaciones |
| User → UserOtp | 1:N | Un usuario puede tener varios OTPs (uno activo a la vez) |
