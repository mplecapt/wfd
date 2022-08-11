import { useForm } from "react-hook-form"
import { SearchIcon } from '@heroicons/react/outline'

function Search({ className }: {
	className: string
}) {
	const {handleSubmit, register, reset} = useForm<{ filter: string }>()

	function onSubmit(values: { filter: string }) {
		alert(JSON.stringify(values))
	}

	return <div className={`relative ${className}`}>
		<form onSubmit={handleSubmit(onSubmit)}>
			<input type='search' placeholder="Find a recipe..." {...register('filter')}
				className='block p-2 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500'
				onKeyDown={(e) => {if (e.key === 'Escape') reset()}}
			/>
			<button type='submit' className="absolute top-0 right-0 p-2 text-sm font-medium text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
				<span className="sr-only">Search</span>
				<SearchIcon className="block h-5 w-5" aria-hidden='true' />
			</button>
		</form>
	</div>
}

export default Search