/* eslint-disable @next/next/no-img-element */
import Image from "next/image"

export function Logo({ allwaysShow }: { allwaysShow?: boolean }) {
	return <img
		className={`block${allwaysShow ? '' : ' lg:hidden'} h-10 w-auto`}
		src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
		alt='WFD Logo'
	/>
}

export function LogoText() {
	return <img
		className="hidden lg:block h-8 w-auto cursor-pointer"
		src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
		alt="Workflow"
	/>
}