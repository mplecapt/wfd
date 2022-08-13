import { Tab } from "@headlessui/react"
import { trpc } from "../utils/trpc"
import { PlusIcon } from '@heroicons/react/solid'

function MyPantriesPage() {
	const { data, isLoading } = trpc.useQuery(['pantries.my-pantries', {}])

	if (isLoading) return <p>Loading...</p>

	// if (data && data.count === 0) return <p>Nothing to see</p>

	return <div className="w-full max-w-md px-2 py-16 sm:px-0">
		<Tab.Group>
			<Tab.List className='flex w-screen space-x-1 bg-blue-900/20 p-1'>
				{data && data.pantries.map((pantry) => (
					<Tab key={pantry.id} className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
						{pantry.name}
					</Tab>
				))}
				<button className="w-full max-w-xs flex justify-center rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 text-blue-100 hover:bg-white/[0.12] hover:text-white">
					<PlusIcon className="h-6" />
				</button>
			</Tab.List>
			<Tab.Panels className='mt-2'>
				{data && data.pantries.map((pantry) => (
					<Tab.Panel key={pantry.id} className='rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
						<ul>
							{data.inventory.filter((item) => (item.pantryId === pantry.id)).map((item) => (
								<li key={item.id} className='relative rounded-md p-3 hover:bg-gray-100'>
									<h3 className="text-sm font-medium leading-5">
										{item.ingredient.name}
									</h3>
								</li>
							))}
						</ul>
					</Tab.Panel>
				))}
				<Tab.Panel key='e1' className='bg-red-300 w-screen'>
					<div>Content</div>
				</Tab.Panel>
				<Tab.Panel key='e2' className='bg-blue-300 w-screen'>
					<div>New Content</div>
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
	</div>
}

export default MyPantriesPage