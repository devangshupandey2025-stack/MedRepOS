import { useUser, useAuth } from "@clerk/clerk-react"
import { Navigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { setTokenGetter } from "../lib/api"

type Props = {
  children: React.ReactNode
  roles?: ("admin" | "manager" | "rep")[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const location = useLocation()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    setTokenGetter(getToken)
    setReady(true)
  }, [isLoaded, isSignedIn, getToken])

  if (!isLoaded || !ready) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (roles && user?.publicMetadata?.role) {
    const role = user.publicMetadata.role as string
    if (!roles.includes(role as any)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
