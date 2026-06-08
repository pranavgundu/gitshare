<script lang="ts">
  import { auth } from './auth.svelte'
  import { passkeysSupported } from './supabase'

  type Passkey = { id: string; friendly_name?: string; created_at: string; last_used_at?: string }

  let passkeys = $state<Passkey[]>([])
  let error = $state<string | null>(null)
  let busy = $state(false)
  let loaded = $state(false)

  async function refresh() {
    const { data, error: err } = await auth.listPasskeys()
    if (err) error = err.message
    else passkeys = data ?? []
    loaded = true
  }

  async function register() {
    error = null
    busy = true
    const { error: err } = await auth.registerPasskey()
    busy = false
    if (err) error = err.message
    else await refresh()
  }

  async function remove(id: string) {
    error = null
    busy = true
    const { error: err } = await auth.deletePasskey(id)
    busy = false
    if (err) error = err.message
    else await refresh()
  }

  $effect(() => {
    refresh()
  })
</script>

{#if passkeysSupported}
  <div class="passkeys">
    <h2>Passkeys</h2>

    {#if loaded && passkeys.length === 0}
      <p class="empty">No passkeys yet. Add one for passwordless sign-in.</p>
    {:else}
      <ul>
        {#each passkeys as pk (pk.id)}
          <li>
            <span class="name">{pk.friendly_name || 'Passkey'}</span>
            <span class="meta">added {new Date(pk.created_at).toLocaleDateString()}</span>
            <button class="del" onclick={() => remove(pk.id)} disabled={busy} aria-label="Delete passkey">
              Remove
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    {#if error}<p class="error">{error}</p>{/if}

    <button class="add" onclick={register} disabled={busy}>
      {busy ? '…' : 'Add a passkey'}
    </button>
  </div>
{/if}

<style>
  .passkeys {
    width: 360px;
    max-width: 100%;
    margin: 0 auto;
    text-align: left;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .name {
    color: var(--text-h);
    font-size: 15px;
  }
  .meta {
    color: var(--text);
    font-size: 13px;
    margin-left: auto;
  }

  .del {
    font: inherit;
    font-size: 13px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #e5484d;
    text-decoration: underline;
  }

  .empty {
    font-size: 14px;
    margin: 0 0 16px;
  }

  .add {
    font: inherit;
    font-size: 16px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--accent);
    background: var(--accent-bg);
    border: 1px solid var(--accent-border);
    width: 100%;
  }
  .add:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .error {
    color: #e5484d;
    font-size: 14px;
  }
</style>
