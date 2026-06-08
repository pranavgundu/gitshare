<script lang="ts">
  import { auth } from './auth.svelte'
  import { passkeysSupported } from './supabase'

  let mode = $state<'signin' | 'signup'>('signin')
  let email = $state('')
  let password = $state('')
  let error = $state<string | null>(null)
  let notice = $state<string | null>(null)
  let busy = $state(false)

  async function signInWithPasskey() {
    error = null
    notice = null
    busy = true
    const { error: err } = await auth.signInWithPasskey()
    busy = false
    if (err) error = err.message
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    error = null
    notice = null
    busy = true

    const { error: err } =
      mode === 'signup'
        ? await auth.signUp(email, password)
        : await auth.signIn(email, password)

    busy = false

    if (err) {
      error = err.message
      return
    }

    if (mode === 'signup' && !auth.session) {
      notice = 'Check your email to confirm your account.'
    }
  }

  function toggle() {
    mode = mode === 'signin' ? 'signup' : 'signin'
    error = null
    notice = null
  }
</script>

<form class="auth" onsubmit={submit}>
  <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>

  <label>
    Email
    <input type="email" bind:value={email} autocomplete="email" required />
  </label>

  <label>
    Password
    <input
      type="password"
      bind:value={password}
      autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
      minlength="6"
      required
    />
  </label>

  {#if error}<p class="msg error">{error}</p>{/if}
  {#if notice}<p class="msg notice">{notice}</p>{/if}

  <button type="submit" disabled={busy}>
    {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
  </button>

  {#if mode === 'signin' && passkeysSupported}
    <div class="divider"><span>or</span></div>
    <button type="button" class="secondary" onclick={signInWithPasskey} disabled={busy}>
      Sign in with a passkey
    </button>
  {/if}

  <p class="switch">
    {mode === 'signin' ? 'No account?' : 'Already have an account?'}
    <button type="button" class="link" onclick={toggle}>
      {mode === 'signin' ? 'Sign up' : 'Sign in'}
    </button>
  </p>
</form>

<style>
  .auth {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 320px;
    max-width: 100%;
    text-align: left;
    margin: 0 auto;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    color: var(--text);
  }

  input {
    font: inherit;
    font-size: 16px;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text-h);
  }

  input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-color: var(--accent-border);
  }

  button[type='submit'] {
    font: inherit;
    font-size: 16px;
    padding: 10px 12px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    color: #fff;
    background: var(--accent);
    transition: opacity 0.2s;
  }

  button[type='submit']:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .secondary {
    font: inherit;
    font-size: 16px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--accent);
    background: var(--accent-bg);
    border: 1px solid var(--accent-border);
    transition: opacity 0.2s;
  }
  .secondary:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text);
    font-size: 13px;
  }
  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .switch {
    font-size: 14px;
    text-align: center;
  }

  .link {
    font: inherit;
    font-size: 14px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--accent);
    text-decoration: underline;
  }

  .msg {
    font-size: 14px;
    margin: 0;
  }
  .error {
    color: #e5484d;
  }
  .notice {
    color: var(--accent);
  }
</style>
