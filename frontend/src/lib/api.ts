import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
})

let tokenGetter: (() => Promise<string | null>) | null = null

export function setTokenGetter(getter: (() => Promise<string | null>) | null) {
  tokenGetter = getter
}

api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api
