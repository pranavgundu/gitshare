import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

class AuthState {
  session = $state<Session | null>(null)
  user = $state<User | null>(null)
  loading = $state(true)

  constructor() {
    supabase.auth.getSession().then(({ data }) => {
      this.session = data.session
      this.user = data.session?.user ?? null
      this.loading = false
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = session
      this.user = session?.user ?? null
      this.loading = false
    })
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
