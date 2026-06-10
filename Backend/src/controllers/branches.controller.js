const prisma = require("../config/prisma");

const GITHUB_API = "https://api.github.com";
const cache = new Map(); // { projectId -> { data, expiresAt } }

async function ghCommits(owner, repo, branch, token) {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0].slice(0, 80),
      author: c.commit.author?.name || "Unknown",
      date: c.commit.author?.date || null,
    }));
  } catch {
    return [];
  }
}

function ticketStatusToTree(status) {
  if (status === "DONE") return "merged";
  if (status === "IN_REVIEW") return "pending_review";
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "BLOCKED") return "blocked";
  return "not_started";
}

function sprintStatusToTree(status) {
  if (status === "COMPLETED") return "merged";
  if (status === "ACTIVE") return "active";
  if (status === "CANCELLED") return "closed";
  return "upcoming";
}

// Extrae el número del sprint de la rama (sprint/1-...) o del nombre
function sprintNumber(sprint) {
  if (sprint.githubBranch) {
    const m = sprint.githubBranch.match(/sprint\/(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  const m = sprint.name.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

async function getProjectBranchesController(req, res) {
  const { projectId } = req.params;

  try {
    // Cache check
    const cached = cache.get(projectId);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: {
          orderBy: { startDate: "asc" },
          include: {
            tickets: {
              include: { assignedTo: true },
            },
          },
        },
      },
    });

    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });

    if (!project.githubRepo) {
      return res.json({ error: "no_github_repo" });
    }

    const owner = process.env.GITHUB_OWNER;
    const token = process.env.GITHUB_TOKEN;
    const repo = project.githubRepo;

    const mainCommits = await ghCommits(owner, repo, "main", token);

    const tree = [
      {
        id: "main",
        name: "main",
        type: "main",
        status: "active",
        commits: mainCommits,
      },
    ];

    for (const sprint of project.sprints) {
      const num = sprintNumber(sprint);
      const sprintCommits = sprint.githubBranch
        ? await ghCommits(owner, repo, sprint.githubBranch, token)
        : [];

      const completedTickets = sprint.tickets.filter((t) => t.status === "DONE").length;
      const totalTickets = sprint.tickets.length;
      const progress = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

      const children = [];
      for (const ticket of sprint.tickets) {
        const ticketCommits = ticket.githubBranch
          ? await ghCommits(owner, repo, ticket.githubBranch, token)
          : [];

        const fullName = ticket.assignedTo?.fullName || ticket.assignedTo?.name || null;
        const initials = fullName
          ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
          : "??";

        children.push({
          id: ticket.id,
          name: ticket.githubBranch || `ticket/TK-${ticket.id.slice(0, 8)}-sin-rama`,
          type: "ticket",
          status: ticketStatusToTree(ticket.status),
          ticketTitle: ticket.title,
          assignee: fullName ? { name: fullName, initials } : null,
          priority: (ticket.priority || "MEDIUM").toLowerCase(),
          prNumber: ticket.githubPrNumber || null,
          prUrl: ticket.githubPrUrl || null,
          commits: ticketCommits,
        });
      }

      tree.push({
        id: sprint.id,
        name: sprint.githubBranch || `sprint/${num}-sin-rama`,
        type: "sprint",
        status: sprintStatusToTree(sprint.status),
        sprintName: sprint.name,
        sprintNumber: num,
        progress,
        totalTickets,
        completedTickets,
        mergedToMain: sprint.status === "COMPLETED",
        commits: sprintCommits,
        children,
      });
    }

    const payload = {
      project: {
        id: project.id,
        name: project.name,
        githubRepo: project.githubRepo,
        defaultBranch: "main",
      },
      tree,
    };

    cache.set(projectId, { data: payload, expiresAt: Date.now() + 60_000 });
    return res.json(payload);
  } catch (err) {
    console.error("[branches] Error:", err.message);
    return res.status(500).json({ message: err.message || "Error interno al cargar ramas" });
  }
}

module.exports = { getProjectBranchesController };
