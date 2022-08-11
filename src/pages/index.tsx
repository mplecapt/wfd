import { NextPage } from "next";
import Link from "next/link";
import { useUserContext } from "../contexts/user.context";

const Home: NextPage = () => {
	const user = useUserContext()

	if (!user) {
		return <p>You are not logged in</p>
	}

	return <div>
		<Link href='/posts/new'>Create post</Link>
	</div>
}

export default Home