import type { Provider, Session, User, UserIdentity } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type OAuthProvider = 'github' | 'gitlab'

const SCOPES: Record<OAuthProvider, string> = {
  github: 'read:user user:email repo',
  gitlab: 'read_user read_api',
}

const PENDING_KEY = 'gitshare.pending_provider'
const tokenKey = (p: OAuthProvider) => `gitshare.provider_token.${p}`

class AuthState {
  session = $state<Session | null>(null)
  user = $state<User | null>(null)
  loading = $state(true)
  identities = $state<UserIdentity[]>([])

  constructor() {
    supabase.auth.getSession().then(({ data }) => {
      this.apply(data.session)
      this.loading = false
      if (data.session) this.loadIdentities()
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      this.apply(session)
      this.loading = false
      if (session) {
        this.captureProviderToken(session)
        this.loadIdentities()
      } else {
        this.identities = []
      }
    })
  }

  private apply(session: Session | null) {
    this.session = session
    this.user = session?.user ?? null
  }

  private captureProviderToken(session: Session) {
    if (!session.provider_token) return
    const pending = localStorage.getItem(PENDING_KEY) as OAuthProvider | null
    if (!pending) return
    localStorage.setItem(
      tokenKey(pending),
      JSON.stringify({
        token: session.provider_token,
        refresh: session.provider_refresh_token ?? null,
      }),
    )
    localStorage.removeItem(PENDING_KEY)
  }

  providerToken(provider: OAuthProvider): string | null {
    const raw = localStorage.getItem(tokenKey(provider))
    return raw ? (JSON.parse(raw).token as string) : null
  }

  isConnected(provider: OAuthProvider): boolean {
    return this.identities.some((i) => i.provider === provider)
  }

  async loadIdentities() {
    const { data } = await supabase.auth.getUserIdentities()
    this.identities = data?.identities ?? []
  }

  connect(provider: OAuthProvider) {
    localStorage.setItem(PENDING_KEY, provider)
    return supabase.auth.linkIdentity({
      provider: provider as Provider,
      options: {
        scopes: SCOPES[provider],
        redirectTo: window.location.origin,
      },
    })
  }

  async disconnect(provider: OAuthProvider) {
    const identity = this.identities.find((i) => i.provider === provider)
    if (!identity) return { error: null }
    const result = await supabase.auth.unlinkIdentity(identity)
    localStorage.removeItem(tokenKey(provider))
    await this.loadIdentities()
    return result
  }

  signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password })
  }

  signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  signOut() {
    return supabase.auth.signOut()
  }

  signInWithPasskey() {
    return supabase.auth.signInWithPasskey()
  }

  registerPasskey() {
    return supabase.auth.registerPasskey()
  }

  listPasskeys() {
    return supabase.auth.passkey.list()
  }

  deletePasskey(passkeyId: string) {
    return supabase.auth.passkey.delete({ passkeyId })
  }
}

export const auth = new AuthState()
