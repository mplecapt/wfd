import { Transition, Dialog } from '@headlessui/react'
import { Fragment } from 'react'
import { XIcon } from '@heroicons/react/outline'

function Modal({ isOpen, setOpen, children, title, closeButton }: {
	isOpen: boolean,
	setOpen: (val: boolean) => void,
	children: React.ReactNode,
	title?: React.ReactNode,
	closeButton?: boolean,
}) {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								{(title || closeButton) && 
									<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
										{title}{closeButton && <div className='float-right cursor-pointer p-1 text-gray-500 hover:text-white hover:bg-red-400 rounded-full'><XIcon className='h-5 w-auto' onClick={()=>setOpen(false)} /></div>}
									</Dialog.Title>
								}
								<div className='mb-4' />
								{children}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default Modal