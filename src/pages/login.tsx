import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { VerifyLoginInput, verifyLoginSchema } from "../schemas/user.schema"
import { trpc } from "../utils/trpc";
import { FormError, Input, InputGroup } from '../components/Form'
import { Logo } from '../components/Logo'
import Link from 'next/link'
import { useRouter } from "next/router";
import { baseUrl } from "../utils/constants";

function LoginPage() {
	const router = useRouter()

	const {
		handleSubmit,
		register,
		formState: { errors, touchedFields }
	} = useForm<VerifyLoginInput>({
		resolver: zodResolver(verifyLoginSchema)
	});

	const { mutate, data, error } = trpc.useMutation(['users.verify-login'], {
		onSuccess: () => {
			window.location.assign(`${baseUrl}${data?.redirect || '/my-pantries'}`)
			// router.push(data?.redirect || '/')
		}
	})

	const onSubmit = (values: VerifyLoginInput) => {
		mutate({ email: values.email, password: values.password, redirect: values.redirect || router.asPath })
	}

	return <div className="w-screen h-10/12 pt-10 flex justify-center items-center">
		<form onSubmit={handleSubmit(onSubmit)} className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-10/12 sm:w-1/3'>
	{/* Form Header */}
			<div className='flex-shrink-0 flex justify-center items-center'>
				<Logo allwaysShow />
			</div>
			<h2 className='block text-grey-darker text-center text-2xl font-bold'>
				Login
			</h2>
	{/* Form Content */}
			<FormError error={error} className="text-red-500 font-bold text-center" />
			<InputGroup name='email' register={register} label='Email' state={ {error: errors.email, touched: touchedFields.email} } />
			<InputGroup name='password' type='password' register={register} label='Password' state={{ error: errors.password, touched: touchedFields.password }} />
			<div className="mb-2" />
	{/* Form Footer */}
			<div className="flex items-center justify-between">
				<button type='submit' className="bg-blue-700 text-white hover:bg-blue-800 hover:text-gray-300 font-bold py-2 px-4 rounded">
					Login
				</button>
				<div className="flex flex-col">
					<Link href='/register'>
						<a className="inline-block align-baseline float-right font-bold text-sm text-blue-700 hover:text-blue-800">
							Need an account?
						</a>
					</Link>
					<Link href='/forgot-password'>
						<a className="inline-block align-baseline float-right font-bold text-sm text-blue-700 hover:text-blue-800">
							Forgot password?
						</a>
					</Link>
				</div>
			</div>
		</form>
	</div>
}

export default LoginPage