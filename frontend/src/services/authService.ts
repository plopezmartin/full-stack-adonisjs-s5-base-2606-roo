import type { AuthResponse, LoginPayload, SignupPayload, User } from '@/types/auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? body.errors?.[0]?.message ?? `Error ${res.status}`)
  }

  return res.json() as Promise<T>
}

/**
 * Lee el access token persistido en `localStorage`.
 *
 * No valida la expiración ni la vigencia en el servidor: que exista un token
 * no implica que la sesión siga siendo válida.
 *
 * @returns El access token almacenado, o `null` si no hay sesión iniciada
 * (nunca se hizo login/signup o se ejecutó `logout`).
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Recupera el usuario cacheado localmente en el último login/signup.
 *
 * Es una instantánea local: puede estar desactualizada respecto al servidor.
 * Usar {@link fetchProfile} para obtener los datos vigentes.
 *
 * @returns El usuario deserializado, o `null` si no hay ninguno almacenado.
 * @throws {SyntaxError} Si el valor guardado en `localStorage` no es JSON válido
 * (p. ej. manipulado manualmente); no se captura internamente.
 */
export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

/**
 * Indica si existe una sesión local, comprobando únicamente la presencia del token.
 *
 * Comprobación síncrona y sin red: un token revocado o caducado en el backend
 * seguirá devolviendo `true` hasta que una petición protegida falle.
 *
 * @returns `true` si hay un token almacenado; `false` en caso contrario.
 */
export function isAuthenticated(): boolean {
  return getToken() !== null
}

function persist({ user, token }: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Registra una cuenta nueva e inicia sesión de inmediato.
 *
 * Como efecto secundario, persiste el token y el usuario devueltos en
 * `localStorage`, por lo que no hace falta llamar a {@link login} después.
 *
 * @param payload - Datos de alta del usuario, tal como los valida el backend
 * (VineJS) en `POST /account/register`.
 * @returns La respuesta de autenticación con el usuario creado y su access token.
 * @throws {Error} Si el backend responde con un estado no 2xx (p. ej. validación
 * fallida o email ya registrado); el mensaje es el `message` del backend, el
 * primer `errors[].message`, o `Error <status>` como último recurso. También
 * propaga los fallos de red de `fetch`. En ambos casos no se persiste nada.
 */
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/account/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  persist(data)
  return data
}

/**
 * Autentica al usuario con sus credenciales y abre sesión.
 *
 * Como efecto secundario, sobrescribe el token y el usuario almacenados en
 * `localStorage`.
 *
 * @param payload - Credenciales de acceso enviadas a `POST /account/login`.
 * @returns La respuesta de autenticación con el usuario y un nuevo access token.
 * @throws {Error} Si las credenciales son inválidas o el backend responde con un
 * estado no 2xx (mensaje extraído igual que en {@link signup}), o si falla la
 * red. La sesión previa, si existía, no se modifica.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/account/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  persist(data)
  return data
}

/**
 * Cierra la sesión: solicita al backend invalidar el token y limpia el estado local.
 *
 * La limpieza de `localStorage` se ejecuta siempre (`finally`), incluso si la
 * petición falla, de modo que el cliente queda desautenticado aunque el token
 * pueda seguir activo en el servidor (p. ej. sin conexión o token ya caducado).
 *
 * @returns Promesa que se resuelve cuando termina la petición y se ha limpiado
 * el almacenamiento local.
 * @throws {Error} Si la petición de logout falla (estado no 2xx o error de red).
 * El error se propaga tras limpiar la sesión local; quien llame puede ignorarlo
 * si solo le interesa el estado local.
 */
export async function logout(): Promise<void> {
  try {
    await request('/account/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Obtiene del backend el perfil actualizado del usuario autenticado.
 *
 * Requiere un token válido; se adjunta automáticamente como `Bearer`. No
 * actualiza la copia local que devuelve {@link getUser}.
 *
 * @returns El usuario vigente según el servidor.
 * @throws {Error} Si no hay sesión o el token es inválido/caducado (401), o ante
 * cualquier otro estado no 2xx o fallo de red. Este servicio no limpia la
 * sesión local en ese caso.
 */
export async function fetchProfile(): Promise<User> {
  const data = await request<{ user: User }>('/account/profile')
  return data.user
}
