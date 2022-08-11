import Link from "next/link"
import { trpc } from "../../utils/trpc"

function PostListingPage() {
	const {data, isLoading} = trpc.useQuery(['posts.posts'])

	if (isLoading) return <p>Loading posts...</p>
	
	return <div>
		<Link href='/posts/new'>Create post</Link>
		{data?.map(post => (
			<article key={post.id}>
				<p>{post.title}</p>
				<Link href={`/posts/${post.id}`}>Read post</Link>
			</article>
		))}
	</div>
}

export default PostListingPage