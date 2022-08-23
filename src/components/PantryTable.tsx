import { PantryItem, Ingredient } from '@prisma/client'
import { trpc } from '../utils/trpc'
import { useEffect, useMemo, useState } from 'react'
import { ColumnDef, Table, Getter } from '@tanstack/react-table'
import { AddToPantryModal } from './AddIngredient'
import { TrashIcon } from '@heroicons/react/solid'
import { Switch } from '@headlessui/react'
import { StyledTable } from './Table'
import { DateSelector } from './Dateselector'

type Item = PantryItem & { ingredient: Ingredient }

export function PantryTable({ pantryId }: {
	pantryId: string
}) {
	const {data, isLoading} = trpc.useQuery(['pantries.get-inventory', { pantryId }])
	
	const columns = useMemo<ColumnDef<Item>[]>(
		() => [
			{
				accessorFn: row => row.id,
				id: 'trash',
				enableColumnFilter: false,
				enableSorting: false,
				header: info => (
					<AddToPantryModal pantryId={pantryId}
						isInInventory={(ingrId) => info.table.options.meta?.dataRef().find(item => item.ingredientId === ingrId) !== undefined }
						onSuccess={newData => newData && info.table.options.meta?.addRow(newData)} 
					/>
				),
				cell: info => <TrashColumn itemId={info.row.original.id} rowIndex={info.row.index} table={info.table} />,
				size: 40
			},
			{
				id: 'inStock',
				accessorFn: row => row.inStock,
				enableColumnFilter: false,
				header: 'Stocked',
				cell: info => (
					<SwitchColumn 
						getValue={info.getValue} 
						index={info.row.index} 
						id={info.column.id} 
						table={info.table} 
						PantryItemId={info.row.original.id}
					/>
				),
				size: 100,
			},
			// {
			// 	id: 'debug',
			// 	accessorFn: row => row.inStock,
			// 	header: 'debug',
			// },
			{
				accessorFn: row => row.ingredient.name,
				id: 'name',
				header: ({ column }) => 'Ingredient',
				// cell: info => info.getValue(),
				size: 300,
			},
			{
				accessorFn: row => row.ingredient.category,
				id: 'category',
				header: () => 'Category',
				cell: info => info.getValue(),
				size: 300,
			},
			{
				accessorKey: 'expiration',
				enableColumnFilter: false,
				header: () => 'Expiration',
				cell: info => <CalendarColumn initValue={info.getValue<Date>()} index={info.row.index} id={info.column.id} table={info.table} PantryItemId={info.row.original.id} />
			},
		], [pantryId]
	)


	if (isLoading) return <p>Loading...</p>
	return <StyledTable initialData={data?.inventory || []} columns={columns} getRowId={ row => row.id } />
}

function SwitchColumn({ getValue, index, id, table, PantryItemId }: {
	getValue: Getter<unknown>,
	index: number,
	id: string,
	table: Table<any>,
	PantryItemId: string
}) {
	const inStock = getValue<boolean>()
	const [checked, setChecked] = useState(inStock)

	const { mutate } = trpc.useMutation(['pantries.update-inventory'], {
		onSuccess() {
			table.options.meta?.updateData(index, id, !checked)
			setChecked(!checked)
		}
	})

	return (
		<div className='flex justify-center items-center'>
			<Switch checked={checked} onChange={()=>mutate({ itemId: PantryItemId, inStock: !checked })} 
				className={`${checked ? 'bg-teal-500 ' : 'bg-gray-600'}
				relative inline-flex cursor-pointer h-7 w-[74px] rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
			>
				{/* The toggle ball */}
				<span aria-hidden="true"
					className={`${checked ? 'translate-x-8' : 'translate-x-0'}
						pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
				/>
			</Switch>
		</div>
	)
}

function TrashColumn({ itemId, rowIndex, table }: {
	itemId: string,
	rowIndex: number,
	table: Table<any>
}) {
	const { mutate } = trpc.useMutation(['pantries.remove-ingredient'], {
		onSuccess() {
			table.options.meta?.removeRow(rowIndex)
		}
	})

	return <div className="flex justify-center items-center" onClick={()=>mutate({ id: itemId })}>
		<TrashIcon className="h-6 w-auto hover:bg-red-200 rounded-full text-red-400 cursor-pointer" />
	</div>
}

function CalendarColumn({ initValue, index, id, table, PantryItemId }: {
	initValue: Date | undefined | null,
	index: number,
	id: string,
	table: Table<any>,
	PantryItemId: string
}) {
	let [state, setState] = useState(initValue)
	useEffect(() => {
		setState(initValue)
	}, [initValue])

	const { mutate } = trpc.useMutation(['pantries.update-inventory'], {
		onSuccess(data) {
			if (data) {
				table.options.meta?.updateData(index, id, data.pantryItem.expiration)
				setState(data.pantryItem.expiration)
			}
		}
	})

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return <div className='flex justify-start gap-2'>
		<DateSelector expired={state ? state.getTime() < today.getTime() : false} selected={state} onChange={date => mutate({ itemId: PantryItemId, expiration: date })} />
	</div>
}