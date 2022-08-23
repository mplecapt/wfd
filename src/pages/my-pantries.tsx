import { useState, Fragment, ReactNode } from 'react'
import { trpc } from "../utils/trpc"
import { Menu, Tab, Transition } from "@headlessui/react"
import { MenuIcon, PlusIcon } from '@heroicons/react/solid'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormError, InputGroup } from '../components/Form'
import Modal from "../components/Modal"
import { CreatePantryInput, createPantrySchema } from "../schemas/pantry.schema"
import { PantryTable } from '../components/PantryTable'
import { ArrowSmLeftIcon, ClipboardCopyIcon, DocumentTextIcon, LogoutIcon, UserAddIcon, UserGroupIcon } from '@heroicons/react/outline'
import { encode } from '../utils/base64'
import { baseUrl } from '../utils/constants'

const tabStyle = ({ selected }: {selected:boolean}) => `rounded-lg inline-flex justify-center p-2 pt-3 text-sm font-medium leading-5 text-gray-300 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-blue-400 shadow text-blue-800' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`

function MyPantriesPage() {
	const [userMode, setUserMode] = useState(false)
	const [editPantry, showEditPantry] = useState<{name: string, id: string} | null>(null)
	const [leavePantry, showLeavePantry] = useState<{name: string, id: string} | null>(null)
	const [invitePantry, showInvitePantry] = useState<{name: string, id: string} | null>(null)
	const { data, isLoading, refetch } = trpc.useQuery(['pantries.my-pantries', {}])

	if (isLoading) return <p>Loading...</p>

	return <div className="w-full">
		<Tab.Group onChange={() => setUserMode(false)} manual>
			<Tab.List className='flex w-screen space-x-1 bg-gray-600 py-2 pr-5 gap-2'>
				<h2 className="px-5 py-2.5 text-md font-bold leading-5 pr-5">My Pantries</h2>
				{data && data.pantries.map((pantry, i) => (
					<Tab key={pantry.id} className={tabStyle} >
						{({ selected }) => <>
							{pantry.name}{selected && <>
								<div className='w-2' />
								<Menu as='div' className='inline-block relative'>
									<div>
										<Menu.Button className='inline-flex w-full justify-center p-1 -mt-1 rounded-md hover:bg-black bg-opacity-20 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
											<MenuIcon aria-hidden='true' className="h-5 w-5 text-blue-200 hover:text-blue-100" />
										</Menu.Button>
									</div>
									<Transition as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className='z-50 absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
											<div className='p-1'>
												<DropdownItem onClick={()=>showInvitePantry(pantry)}>
													<UserAddIcon aria-hidden='true' className='mr-2 h-5 w-5' /> Invite User
												</DropdownItem>
												<DropdownItem onClick={() => {setUserMode(true)}}>
													<UserGroupIcon aria-hidden='true' className='mr-2 h-5 w-5' /> Manage Users
												</DropdownItem>
												<DropdownItem onClick={()=>showEditPantry(pantry)}>
													<DocumentTextIcon aria-hidden='true' className='mr-2 h-5 w-5' /> Rename Pantry
												</DropdownItem>
												<DropdownItem onClick={()=>showLeavePantry(pantry)}>
													<LogoutIcon aria-hidden='true' className='mr-2 h-5 w-5' /> Leave Pantry
												</DropdownItem>
											</div>
										</Menu.Items>
									</Transition>
								</Menu>
							</>}
						</>}
					</Tab>
				))}
				<NewPantryModal onSuccess={refetch}/>
			</Tab.List>
			<Tab.Panels className=''>
				{data && data.pantries.map((pantry) => (
					<Tab.Panel key={pantry.id} className='w-screen pr-[1px]'>
						{!userMode ? (
							<PantryTable pantryId={pantry.id} />
						) : (
							<div className='p-3'>
								<button onClick={()=>setUserMode(false)} className='bg-blue-700 rounded-lg hover:bg-blue-800 hover:text-gray-200 pl-1 pt-1 pr-3'>
									<ArrowSmLeftIcon aria-label='Return' className='h-8 w-auto p-1 -mt-1 inline-block' /> Return
								</button>
								<h1>User management page</h1>
							</div>
						)}
					</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
		{editPantry && <EditPantryModal pantry={editPantry} close={()=>showEditPantry(null)} onSuccess={()=>refetch()} />}
		{leavePantry && <LeavePantryModal pantry={leavePantry} close={()=>showLeavePantry(null)} onSuccess={()=>refetch()} />}
		{invitePantry && <InviteUserModal pantry={invitePantry} close={()=>showInvitePantry(null)} />}
	</div>
}

function DropdownItem({ children, onClick }: { children?: ReactNode, onClick?: ()=>void }) {
	return (
		<Menu.Item>
		{({ active }) => (
			<button onClick={onClick} type='button' className={`${ active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md p-2 text-sm`}>
				{children}
			</button>
		)}
		</Menu.Item>
	)
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

interface ModalProps {
	pantry: { id: string, name: string },
	close: () => void,
	onSuccess?: () => void,
}

function EditPantryModal({ pantry, close, onSuccess }: ModalProps) {

	const { handleSubmit, register, reset, formState: { errors, touchedFields } } = useForm<CreatePantryInput>({ resolver: zodResolver(createPantrySchema) })

	const { mutate, error } = trpc.useMutation(['pantries.update-name'], {
		onSuccess(data) {
			close()
			reset()
			if (onSuccess && data) onSuccess()
		}
	});

	const onSubmit = (values: CreatePantryInput) => {
		mutate({ pantryId: pantry.id, name: values.name })
	}

	return <>
		<Modal isOpen={pantry !== null} setOpen={close} title="Create New Pantry">
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormError error={error} className="text-red-500 font-bold text-center" />
				<InputGroup name='name' label='Name' register={register} placeholder={pantry.name} autoComplete="off" state={{ error: errors.name, touched: touchedFields.name }} />
				<div className="mt-4 float-right">
					<button type="reset" onClick={() => {close(); reset()}} className="bg-gray-500 text-white hover:bg-gray-600 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
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

function LeavePantryModal({ pantry, close, onSuccess }: ModalProps) {
	const { mutate } = trpc.useMutation(['pantries.untrack'], {
		onSuccess() {
			close()
			onSuccess && onSuccess()
		}
	})

	return <>
		<Modal isOpen={pantry !== null} setOpen={close}>
			<div className='text-lg text-gray-700'>
				<h2 className='text-red-400 text-xl'><strong>Warning:</strong></h2>
				<p>Are you sure you want to leave <strong>{pantry.name}</strong>?</p>
				<p>You will need an invite to rejoin.</p>
			</div>
			<div className='mt-4 flex justify-center gap-2'>
				<button type='reset' onClick={close} className="bg-gray-500 text-white hover:bg-gray-600 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
					Cancel
				</button>
				<button type="submit" onClick={()=>{mutate({ pantryId: pantry.id })}} className="bg-red-400 text-white hover:bg-red-500 hover:text-gray-300 py-2 px-4 text-sm font-medium rounded-md">
					Confirm
				</button>
			</div>
		</Modal>
	</>
}

function InviteUserModal({ pantry, close, onSuccess }: ModalProps) {
	const [copied, setCopied] = useState(false)
	const link = `${baseUrl}/share/${encode(pantry.id)}`

	return <>
		<Modal isOpen={pantry !== null} setOpen={close} closeButton
			title={<h2 className='inline-block text-xl text-green-400 font-bold'>Share this link!</h2>}
		>
			<div className='text-gray-700 flex justify-between gap-1 items-center'>
				<textarea onClick={(e)=> {
						e.preventDefault(); 
						(e.target as HTMLTextAreaElement).select()
					}}
					readOnly value={link}
					className='ring-2 rounded-md ring-gray-500 bg-gray-100 w-full p-1'
				/>
				<div className='tooltip'>
					<span className='tooltiptext text-sm'>{copied ? 'Copied!' : 'Copy to clipboard'}</span>
					<button onClick={() => {navigator.clipboard.writeText(link); setCopied(true)}}
						onMouseOut={() => setCopied(false)}
						className='bg-blue-500 hover:bg-blue-600 text-white rounded-md p-1'
					>
						<ClipboardCopyIcon className='h-6 w-auto inline-block p-1' />
					</button>
				</div>
			</div>
		</Modal>
	</>
}

export default MyPantriesPage