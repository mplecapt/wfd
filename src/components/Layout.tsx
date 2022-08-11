import { Disclosure, Menu, Transition } from "@headlessui/react"
import { XIcon, MenuIcon } from '@heroicons/react/outline'
import { useRouter } from "next/router"
import { ReactNode } from "react"
import { useUserContext } from "../contexts/user.context"
import Search from '../components/Search'
import { Fragment } from "react"
import Link from 'next/link'
import {Logo, LogoText} from "./Logo"

const navAddresses = [
	{ name: 'Home', 							href: '/'				 },
	{ name: 'Browse Recipes',			href:'/recipes'	 },
	{ name: 'Generate Mealplan', 	href:'/mealplan' },
]

const userAddresses = [
	{ name: 'My Pantries', href:'/my-pantries' },
	{ name: 'My Recipes', href:'/my-recipes' },
	{ name: 'Settings', href: '/settings' },
	{ name: 'Logout', href: '/logout'}
]

/**
 * Navigation bar / header
 */
function Header() {
	const user = useUserContext();
	const router = useRouter();

	return (
		<Disclosure as='nav' className='bg-gray-800'>
			{({ open }) => (<>
				<div className="max-w-7x1 mx-auto px-2 sm:px-6 lg:px-8">
					<div className="relative flex items-center justify-between h-16">
				{/* Mobile nav button */}
						<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
							<Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-whtie">
								<span className="sr-only">Open main menu</span>
								{open ? (
									<XIcon className="block h-6 w-6" aria-hidden='true' />
								) : (
									<MenuIcon className="block h-6 w-6" aria-hidden='true' />
								)}
							</Disclosure.Button>
						</div>
						
				{/* Left Header */}
						<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
					{/* Logo segment */}
							<div className="flex-shrink-0 flex items-center">
								<Link href='/wfd'>
									<Logo />
								</Link>
								<Link href='/wfd'>
									<LogoText />
								</Link>
							</div>							
					{/* Nav Links */}
							<div className="hidden sm:block sm:ml-6">
								<div className="flex space-x-4">
									{navAddresses.map((item) => {
										const iscurr = router.pathname.includes(item.href);
										return (
										<Link key={item.name} href={item.href}>
											<a className={`px-3 py-2 rounded-md text-sm font-medium ${iscurr ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
												aria-current={iscurr ? 'page' : undefined}
											>{item.name}</a>
										</Link>
									)})}
								</div>
							</div>
						</div>
				{/* Right Header */}
						<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
					{/* Search bar */}
							<Search className='hidden sm:block sm:w-[350px]' />						
					{/* Profile dropdown */}
							{user ? (
								<AccountDropdown />
							) : (
								<button type='button' onClick={() => {router.push('/login')}} className="mx-3 px-3 py-2 rounded-md text-sm font-medium hover:text-gray-300 hover:bg-blue-800 bg-blue-700 text-white">
									Login
								</button>
							)}
						</div>
					</div>
				</div>
			</>)}
		</Disclosure>
	)
}

/**
 * Account dropdown component
 */
function AccountDropdown() {
	return (
		<Menu as='div' className="ml-3 relative">
			{/* Menu button */}
			<div>
				<Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
					<span className="sr-only">Open user menu</span>
					<picture>
						<source srcSet="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" type='image/png' />
						<img
							className="h-8 w-8 rounded-full"
							src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
							alt=""
						/>
					</picture>
				</Menu.Button>
			</div>
			{/* Dropdown contents */}
			<Transition as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom='transform opacity-0 scale-95'
				enterTo='transform opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom="transform opacity-100 scale-100"
				leaveTo='trasnform opacity-0 scale-95'
			>
				<Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
					{userAddresses.map((path) => (
						<Menu.Item key={path.name}>
							{({ active }) => (
								<a href={path.href} className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100': ''}`}>
									{path.name}
								</a>
							)}
						</Menu.Item>
					))}
				</Menu.Items>
			</Transition>
		</Menu>
	)
}

/**
 * Layout component
 * Used to add standard headers/footers/layout to any component
 * ie:
 * 	<Layout>
 * 		<PageContent />
 * 	</Layout>
 */
function Layout({ children }: { children: ReactNode}) {
	return <>
		<Header />
		<main>{children}</main>
	</>
}

export default Layout;