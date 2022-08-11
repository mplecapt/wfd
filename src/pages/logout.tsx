import { useRouter } from "next/router"
import { trpc } from "../utils/trpc"

function LogoutPage() {
	const router = useRouter()

	const {data, isLoading} = trpc.useQuery(['users.logout-user'])

	if (isLoading) return <p>Logging out...</p>

	router.push(data?.redirect || '/')
	return <p>Redirecting...</p>
}

export default LogoutPage