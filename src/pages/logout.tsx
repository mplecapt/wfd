import { useRouter } from "next/router"
import { baseUrl } from "../utils/constants"
import { trpc } from "../utils/trpc"

function LogoutPage() {
	const router = useRouter()

	const {data, isLoading} = trpc.useQuery(['users.logout-user'])

	if (isLoading) return <p>Logging out...</p>

	// router.push(data?.redirect || '/')
	window.location.assign(baseUrl)
	return <p>Redirecting...</p>
}

export default LogoutPage