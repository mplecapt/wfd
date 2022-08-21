import { useState } from 'react'
import { trpc } from '../utils/trpc'
import Modal from './Modal'
import { PlusIcon } from '@heroicons/react/solid'
import { Disclosure } from '@headlessui/react'
import { IngredientCategories, CreateIngredientInput, createIngredientSchema } from '../schemas/ingredient.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormError, InputGroup } from './Form'
import { Ingredient, PantryItem } from '@prisma/client'

type Item = PantryItem & {ingredient: Ingredient};
export function AddToPantryModal({ pantryId, isInInventory, onSuccess }: { 
	pantryId: string, 
	isInInventory: (ingrId: string) => boolean,
	onSuccess?: (newItem?: Item) => void 
}) {
	let [isOpen, setOpen] = useState(false)

	const { data, isLoading, refetch } = trpc.useQuery(['ingredients.all-ingredients', {}])
	const { mutate } = trpc.useMutation(['pantries.add-ingredient'], {
		onSuccess(data) {
			setOpen(false)
			// refetch()
			if (onSuccess) onSuccess(data?.newPantryItem)
		}
	})

	return <>
		<button type='button' onClick={() => setOpen(true)} disabled={isLoading}
			className="bg-blue-700 hover:bg-blue-800 text-white hover:text-gray-300 rounded-md px-2 py-1 leading-7 hover:ring-offset-1 hover:ring-1"
		>
			<PlusIcon className="h-5 w-auto inline-block -mt-1" />
		</button>

		<Modal isOpen={isOpen} setOpen={setOpen} closeButton title='Add Ingredient to List'>
			<div className=" max-h-[70vh] overflow-y-auto">
				{IngredientCategories.map((cat) => (
					<Disclosure key={cat}>
						<Disclosure.Button className='bg-blue-400 text-gray-100 cursor-default w-full rounded-md py-1 my-2 shadow-sm shadow-gray-500'>{cat}</Disclosure.Button>
						<Disclosure.Panel static className='flex px-1 pb-1'>
							{data && data.count > 0 && data.ingredients.filter((ingr) => ingr.category === cat).map((ingr) => {
								const found = isInInventory(ingr.id)
								return (
									<button type='button' key={ingr.id} onClick={() => mutate({ pantryId: pantryId, ingredientId: ingr.id })} disabled={found}
										className={`rounded-full w-max leading-7 whitespace-nowrap px-3 font-light m-0.5 transition-all ${!found ? 'cursor-pointer bg-blue-600 hover:bg-blue-500 hover:ring hover:ring-offset-1' : 'cursor-default bg-gray-400 text-gray-200'}`}
									>{ingr.name}</button>
								)
							})}
						</Disclosure.Panel>
					</Disclosure>
				))}
			</div>
			<CreateIngredientModal onSuccess={() => refetch()} />
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
		<button type='button' onClick={() => setOpen(true)} className=" float-right leading-5 text-white bg-blue-700 hover:text-gray-300 hover:bg-blue-800 rounded-md px-3 py-2">
			Not in list? <PlusIcon className="h-4 w-auto -mt-1 inline-block" />
		</button>

		<Modal isOpen={isOpen} setOpen={setOpen} title="Add Ingredient to List">
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormError error={error} className='text-red-500 text-center font-bold' />
				<InputGroup name='name' label='Name' autoComplete='off' register={register} state={{ error: errors.name, touched: touchedFields.name }} />
				<InputGroup name='category' type='select' options={Category} label='Category' register={register} state={{ error: errors.category, touched: touchedFields.category }} />
				<div className="mt-4 float-right">
					<button type="reset" onClick={() => { reset(); setOpen(false) }} className="bg-gray-500 text-white hover:bg-gray-600 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
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