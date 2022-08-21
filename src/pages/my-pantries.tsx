import { useState } from 'react'
import { trpc } from "../utils/trpc"
import { Tab } from "@headlessui/react"
import { PlusIcon } from '@heroicons/react/solid'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormError, InputGroup } from '../components/Form'
import Modal from "../components/Modal"
import { CreatePantryInput, createPantrySchema } from "../schemas/pantry.schema"
import { PantryTable } from '../components/PantryTable'

function MyPantriesPage() {
	const { data, isLoading, refetch } = trpc.useQuery(['pantries.my-pantries', {}])

	if (isLoading) return <p>Loading...</p>

	return <div className="w-full">
		<Tab.Group>
			<Tab.List className='flex w-screen space-x-1 bg-gray-600 py-2 pr-5'>
				<h2 className="px-5 py-2.5 text-md font-bold leading-5 pr-5">My Pantries</h2>
				{data && data.pantries.map((pantry) => (
					<Tab key={pantry.id} className={({ selected }) => `rounded-lg px-5 py-2.5 text-sm font-medium leading-5 text-gray-300 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-blue-400 shadow text-blue-800' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
						{pantry.name}
					</Tab>
				))}
				<NewPantryModal onSuccess={refetch}/>
			</Tab.List>
			<Tab.Panels className=''>
				{data && data.pantries.map((pantry) => (
					<Tab.Panel key={pantry.id} className='p-3 w-screen'>
						<PantryTable pantryId={pantry.id} />
					</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
	</div>
}

function NewPantryModal({ onSuccess }: { onSuccess?: () => void }) {
	let [isOpen, setOpen] = useState(false)

	const { handleSubmit, register, reset, formState: { errors, touchedFields } } = useForm<CreatePantryInput>({ resolver: zodResolver(createPantrySchema) })

	const { mutate, error } = trpc.useMutation(['pantries.create-new'], {
		onSuccess({ newPantry }) {
			setOpen(false)
			reset()
			if (onSuccess) onSuccess()
		}
	});

	const onSubmit = (values: CreatePantryInput) => {
		mutate({ name: values.name })
	}

	return <>
		<button type="button" onClick={() => setOpen(true)} className="text-blue-100 hover:text-white rounded-lg px-5 py-2.5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 hover:bg-white/[0.12]">
			<PlusIcon className="h-5 w-auto" />
		</button>

		<Modal isOpen={isOpen} setOpen={setOpen} title="Create New Pantry">
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormError error={error} className="text-red-500 font-bold text-center" />
				<InputGroup name='name' label='Name' register={register} autoComplete="off" state={{ error: errors.name, touched: touchedFields.name }} />
				<div className="mt-4 float-right">
					<button type="reset" onClick={() => {setOpen(false); reset()}} className="bg-gray-500 text-white hover:bg-gray-600 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
						Cancel
					</button>
					<span className="mx-1" />
					<button type="submit" className="bg-blue-700 text-white hover:bg-blue-800 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
						Submit
					</button>
				</div>
			</form>
		</Modal>
	</>
}

export default MyPantriesPage