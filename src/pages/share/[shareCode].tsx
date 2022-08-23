import { useRouter } from "next/router"
import Error from 'next/error'
import { decode } from "../../utils/base64"
import { trpc } from "../../utils/trpc"
import { useEffect } from "react"

export default function JoinPantryPage() {
	const router = useRouter()
	const code = router.query.shareCode as string
	const pantryId = decode(code)

	const { mutate } = trpc.useMutation(['pantries.track'], {
		onSuccess() {
			router.push('/my-pantries')
		}
	})

	useEffect(()=>{
		mutate({ pantryId })
	}, [mutate, pantryId])

	return <p>Redirecting...</p>
}