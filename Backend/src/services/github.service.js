// Usa fetch nativo de Node 18+ con un PAT (Personal Access Token).
// GitHub Apps no pueden crear repos en cuentas personales — el PAT sí puede.
// El webhook de GitHub sigue verificándose con GITHUB_WEBHOOK_SECRET (sin cambios).

const GITHUB_API = "https://api.github.com";

// ── Helper HTTP ────────────────────────────────────────────────────────────
async function gh(method, endpoint, body) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${GITHUB_API}${endpoint}`, options);

  if (res.status === 204) return {};

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "GitHub API error");
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Slugify ────────────────────────────────────────────────────────────────
function toSlug(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

// ── FUNCIÓN 2: createRepository ───────────────────────────────────────────
async function createRepository(projectName, description) {
  const owner = process.env.GITHUB_OWNER;
  const baseSlug = toSlug(projectName);

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const name = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    try {
      const data = await gh("POST", "/user/repos", {
        name,
        description: description || "",
        auto_init: true,
        private: false,
      });
      return { repoName: data.name, repoUrl: data.html_url };
    } catch (error) {
      if (error.status === 422) { lastError = error; continue; }
      throw error;
    }
  }
  throw lastError || new Error("No se pudo crear el repositorio después de 3 intentos");
}

// ── FUNCIÓN 3: createSprintBranch ─────────────────────────────────────────
async function createSprintBranch(repoName, sprintNumber, sprintName) {
  const owner = process.env.GITHUB_OWNER;
  const branchName = `sprint/${sprintNumber}-${toSlug(sprintName)}`;

  const mainRef = await gh("GET", `/repos/${owner}/${repoName}/git/ref/heads/main`);

  await gh("POST", `/repos/${owner}/${repoName}/git/refs`, {
    ref: `refs/heads/${branchName}`,
    sha: mainRef.object.sha,
  });

  return branchName;
}

// ── FUNCIÓN 4: createTicketBranch ─────────────────────────────────────────
async function createTicketBranch(repoName, sprintBranch, ticketId, ticketName) {
  const owner = process.env.GITHUB_OWNER;
  const branchName = `ticket/TK-${ticketId.slice(0, 8)}-${toSlug(ticketName)}`;

  let baseSha;
  try {
    const sprintRef = await gh("GET", `/repos/${owner}/${repoName}/git/ref/heads/${sprintBranch}`);
    baseSha = sprintRef.object.sha;
  } catch {
    // Rama del sprint no existe en GitHub (Caso 4): crearla desde main
    const mainRef = await gh("GET", `/repos/${owner}/${repoName}/git/ref/heads/main`);
    await gh("POST", `/repos/${owner}/${repoName}/git/refs`, {
      ref: `refs/heads/${sprintBranch}`,
      sha: mainRef.object.sha,
    });
    baseSha = mainRef.object.sha;
  }

  await gh("POST", `/repos/${owner}/${repoName}/git/refs`, {
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  return branchName;
}

// ── FUNCIÓN 5: mergeSprintToMain ──────────────────────────────────────────
async function mergeSprintToMain(repoName, sprintBranch, sprintName) {
  const owner = process.env.GITHUB_OWNER;
  try {
    await gh("POST", `/repos/${owner}/${repoName}/merges`, {
      base: "main",
      head: sprintBranch,
      commit_message: `Merge sprint: ${sprintName}`,
    });
    return { success: true };
  } catch (error) {
    if (error.status === 409) return { success: false, reason: "conflicts" };
    if (error.status === 404) return { success: false, reason: "branch_not_found" };
    throw error;
  }
}

// ── FUNCIÓN 6: getPullRequestStatus ───────────────────────────────────────
async function getPullRequestStatus(repoName, prNumber) {
  const owner = process.env.GITHUB_OWNER;
  const data = await gh("GET", `/repos/${owner}/${repoName}/pulls/${prNumber}`);
  return {
    state: data.state,
    merged: data.merged,
    reviewDecision: data.review_decision || null,
  };
}

module.exports = {
  createRepository,
  createSprintBranch,
  createTicketBranch,
  mergeSprintToMain,
  getPullRequestStatus,
};
