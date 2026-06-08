<script lang="ts">
  import heroImg from './assets/hero.png'
  import { auth } from './lib/auth.svelte'
  import Auth from './lib/Auth.svelte'
  import Passkeys from './lib/Passkeys.svelte'
</script>

<section id="center">
  <div class="hero">
    <img src={heroImg} class="base" width="170" height="179" alt="" />
  </div>

  {#if auth.loading}
    <p>Loading…</p>
  {:else if auth.user}
    <div>
      <h1>Welcome</h1>
      <p>Signed in as <code>{auth.user.email}</code></p>
    </div>
    <Passkeys />
    <button class="counter" onclick={() => auth.signOut()}>Sign out</button>
  {:else}
    <div>
      <h1>Get started</h1>
      <p>Sign in to gitshare</p>
    </div>
    <Auth />
  {/if}
</section>

<div class="ticks"></div>
<section id="spacer"></section>
