import { useRouter } from "next/router";
import { useUserContext } from "../../contexts/user.context";

function RedirectPage() {
	const router = useRouter()

	const user = useUserContext();

	if (!user) return <p>Loading...</p>

	router.push('/');
	return <p>Redirecting...</p>
}

export default RedirectPage