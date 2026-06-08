<script lang="ts">
  import { auth, type OAuthProvider } from './auth.svelte'
  import { fetchGitHubRepos, fetchGitLabProjects, type Repo } from './providers'

  const providers: { id: OAuthProvider; label: string }[] = [
    { id: 'github', label: 'GitHub' },
    { id: 'gitlab', label: 'GitLab' },
  ]

  let busy = $state<OAuthProvider | null>(null)
  let error = $state<string | null>(null)
  let repos = $state<Record<OAuthProvider, Repo[] | null>>({ github: null, gitlab: null })

  async function connect(p: OAuthProvider) {
    error = null
    const { error: err } = await auth.connect(p)
    if (err) error = err.message
  }

  async function disconnect(p: OAuthProvider) {
    error = null
    busy = p
    const { error: err } = await auth.disconnect(p)
    busy = null
    repos[p] = null
    if (err) error = err.message
  }

  async function fetchData(p: OAuthProvider) {
    error = null
    busy = p
    try {
      const token = auth.providerToken(p)
      if (!token) throw new Error('No access token stored — reconnect to grant access.')
      repos[p] = p === 'github' ? await fetchGitHubRepos(token) : await fetchGitLabProjects(token)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      busy = null
    }
  }
</script>

<div class="connections">
  <h2>Connected accounts</h2>

  {#each providers as p (p.id)}
    {@const connected = auth.isConnected(p.id)}
    <div class="provider">
      <div class="row">
        <span class="label">{p.label}</span>
        {#if connected}
          <span class="status on">Connected</span>
          <button class="ghost" onclick={() => fetchData(p.id)} disabled={busy === p.id}>
            {busy === p.id ? '…' : 'Fetch data'}
          </button>
          <button class="ghost danger" onclick={() => disconnect(p.id)} disabled={busy === p.id}>
            Disconnect
          </button>
        {:else}
          <button class="connect" onclick={() => connect(p.id)} disabled={busy === p.id}>
            Connect
          </button>
        {/if}
      </div>

      {#if repos[p.id]}
        <ul class="repos">
          {#each repos[p.id]! as r (r.url)}
            <li>
              <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>
              {#if r.description}<span class="desc">{r.description}</span>{/if}
            </li>
          {:else}
            <li class="desc">No repositories returned.</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}

  {#if error}<p class="error">{error}</p>{/if}
</div>

<style>
  .connections {
    width: 420px;
    max-width: 100%;
    margin: 0 auto;
    text-align: left;
  }

  .provider {
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .label {
    color: var(--text-h);
    font-size: 15px;
  }

  .status.on {
    font-size: 13px;
    color: var(--accent);
    margin-right: auto;
  }

  .connect {
    margin-left: auto;
  }

  .connect,
  .ghost {
    font: inherit;
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--accent);
    background: var(--accent-bg);
    border: 1px solid var(--accent-border);
  }
  .ghost.danger {
    color: #e5484d;
    background: none;
    border-color: var(--border);
  }
  .connect:disabled,
  .ghost:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .repos {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .repos a {
    color: var(--text-h);
    font-size: 14px;
  }
  .desc {
    display: block;
    color: var(--text);
    font-size: 13px;
  }

  .error {
    color: #e5484d;
    font-size: 14px;
  }
</style>
