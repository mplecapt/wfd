import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { CreatePostInput } from "../../server/router/post"
import { trpc } from "../../utils/trpc"

function CreatePostPage() {
	const {handleSubmit, register} = useForm<CreatePostInput>()
	const router = useRouter();

	const {mutate, error} = trpc.useMutation(['posts.create-post'], {
		onSuccess: ({ id }) => {
			router.push(`/posts/${id}`)
		}
	})

	function onSubmit(values: CreatePostInput) {
		mutate(values);
	}

	return <form onSubmit={handleSubmit(onSubmit)}>
		{error && error.message}

		<h1>Create Post</h1>

		<input type='text' placeholder="Your Post Title" {...register('title')} /><br />
		<textarea placeholder="Your Post Body" {...register('body')} /><br />
		<button type='submit'>Create post</button>
	</form>
}

export default CreatePostPage