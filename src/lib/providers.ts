export type Repo = {
  name: string
  url: string
  description: string | null
  updatedAt: string
}

export async function fetchGitHubRepos(token: string): Promise<Repo[]> {
  const res = await fetch(
    'https://api.github.com/user/repos?per_page=10&sort=updated&affiliation=owner',
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } },
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.map((r: any) => ({
    name: r.full_name,
    url: r.html_url,
    description: r.description,
    updatedAt: r.updated_at,
  }))
}

export async function fetchGitLabProjects(token: string): Promise<Repo[]> {
  const res = await fetch(
    'https://gitlab.com/api/v4/projects?membership=true&per_page=10&order_by=updated_at',
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error(`GitLab API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.map((p: any) => ({
    name: p.path_with_namespace,
    url: p.web_url,
    description: p.description,
    updatedAt: p.last_activity_at,
  }))
}
