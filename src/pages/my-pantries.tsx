import { Disclosure, Tab } from "@headlessui/react"
import { trpc } from "../utils/trpc"
import { PlusIcon } from '@heroicons/react/solid'
import { useState } from 'react'
import Modal from "../components/Modal"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AddIngredientInput, addIngredientToPantrySchema, CreatePantryInput, createPantrySchema } from "../schemas/pantry.schema"
import { FormError, Input, InputGroup, Select } from '../components/Form'
import { CreateIngredientInput, createIngredientSchema, IngredientCategories } from "../schemas/ingredient.schema"
import { z } from "zod"
import { Pantry, PantryItem } from "@prisma/client"

function MyPantriesPage() {
	const { data, isLoading, refetch } = trpc.useQuery(['pantries.my-pantries', {}])

	if (isLoading) return <p>Loading...</p>

	return <div className="w-full max-w-md px-2 sm:px-0">
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
					<Tab.Panel key={pantry.id} className='p-3 w-screen bg-white'>
						<AddToPantryModal pantry={pantry}	onSuccess={()=>refetch()} />
						<ul>
							{pantry.inventory.length > 0 ? (
								data.inventories.filter((item) => item.pantryId === pantry.id).map((item) => (
									<li key={item.id} className='text-black'>{item.ingredient.name}</li>
								))
							) : (
								<li><p className="text-black">Nothing in pantry</p></li>
							)}
						</ul>
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

function AddToPantryModal({ pantry, onSuccess }: { pantry: Pantry, onSuccess?: ()=>void }) {
	let [isOpen, setOpen] = useState(false)

	const { data, isLoading, refetch } = trpc.useQuery(['ingredients.all-ingredients', { }])
	const { mutate } = trpc.useMutation(['pantries.add-ingredient'], {
		onSuccess() {
			setOpen(false)
			refetch()
			if (onSuccess) onSuccess()
		}
	})

	const addIngredient = (ingredientId: string) => {
		mutate({ pantryId: pantry.id, ingredientId })
	}

	return <>
		<button type='button' onClick={()=>setOpen(true)} disabled={isLoading}
			className="bg-blue-700 hover:bg-blue-800 text-white hover:text-gray-300 rounded-md px-2 py-1 leading-7 hover:ring-offset-1 hover:ring-1"
		>
			<PlusIcon className="h-5 w-auto inline-block -mt-1"/> Ingredient
		</button>

		<Modal isOpen={isOpen} setOpen={setOpen} closeButton title='Add Ingredient to List'>
			<div className=" max-h-[70vh] overflow-y-auto">
				{IngredientCategories.map((cat) => (
					<Disclosure key={cat}>
						<Disclosure.Button className='bg-blue-400 text-gray-100 cursor-default w-full rounded-md py-1 my-2 shadow-sm shadow-gray-500'>{cat}</Disclosure.Button>
						<Disclosure.Panel static className='flex px-1 pb-1'>
							{data && data.count > 0 && data.ingredients.filter((ingr) => ingr.category === cat).map((ingr) => (
								<span key={ingr.id} onClick={()=>{addIngredient(ingr.id)}}
									className={`rounded-full w-max leading-7 whitespace-nowrap px-3 font-light m-0.5 transition-all ${ !ingr.inPantry.find((i)=> i.pantryId === pantry.id) ? 'cursor-pointer bg-blue-600 hover:bg-blue-500 hover:ring hover:ring-offset-1' : 'cursor-default bg-gray-400 text-gray-200'}`}
								>{ingr.name}</span>
							))}
							</Disclosure.Panel>
					</Disclosure>
				))}
			</div>
			<CreateIngredientModal onSuccess={()=>refetch()} />
		</Modal>
	</>
}

function CreateIngredientModal({ onSuccess }: { onSuccess?: () => void }) {
	let [isOpen, setOpen] = useState(false)

	const Category = IngredientCategories.concat();

	const { mutate, error } = trpc.useMutation(['ingredients.create-new'], {
		onSuccess() {
			setOpen(false)
			reset()
			if (onSuccess) onSuccess()
		}
	})

	const { handleSubmit, register, reset, formState: { errors, touchedFields } } = useForm<CreateIngredientInput>({ resolver: zodResolver(createIngredientSchema) })

	const onSubmit = (values: CreateIngredientInput) => {
		mutate(values)
	}

	return <>
		<button type='button' onClick={()=>setOpen(true)} className=" float-right leading-5 text-white bg-blue-700 hover:text-gray-300 hover:bg-blue-800 rounded-md px-3 py-2">
			Not in list? <PlusIcon className="h-4 w-auto -mt-1 inline-block"/>
		</button>

		<Modal isOpen={isOpen} setOpen={setOpen} title="Add Ingredient to List">
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormError error={error} className='text-red-500 text-center font-bold' />
				<InputGroup name='name' label='Name' autoComplete='off' register={register} state={{ error: errors.name, touched: touchedFields.name }} />
				<InputGroup name='category' type='select' options={Category} label='Category' register={register} state={{ error: errors.category, touched: touchedFields.category }} />
				<div className="mt-4 float-right">
					<button type="reset" onClick={() => {reset(); setOpen(false)}} className="bg-gray-500 text-white hover:bg-gray-600 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
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