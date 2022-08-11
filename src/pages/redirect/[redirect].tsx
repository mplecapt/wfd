import { useRouter } from "next/router";
import { useUserContext } from "../../contexts/user.context";

function RedirectPage() {
	const router = useRouter()

	const redirect = router.query.redirect as string

	const user = useUserContext();

	if (!user) return <p>Loading...</p>

	router.push(redirect);
	return <p>Redirecting...</p>
}

export default RedirectPage