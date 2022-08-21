import { TRPCClientErrorLike } from '@trpc/client';
import React, { Fragment, useState } from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form'
import { Switch, Transition } from '@headlessui/react';
import { CheckIcon, XIcon } from '@heroicons/react/solid'

export function FormError({ error, errorName, ...rest }: {
	error?: FieldError | TRPCClientErrorLike<any> | null,
	[x:string]: any
}) {
	return error
		? <span className='text-red-500 text-sm italic' {...rest}>{error.message}</span>
		: null
}

export function Input ({ register, name, ...rest }: {
	register: UseFormRegister<any>,
	name: string,
	[x:string]: any,
}) {
	return <input {...register(name)} {...rest} />
}

export function Select ({ register, name, options, ...rest }: {
	register: UseFormRegister<any>,
	name: string,
	options: string[],
	[x:string]: any
}) {
	return (
		<select {...register(name)} {...rest}>
			{options.map(value => (
				<option key={value} value={value}>{value}</option>
			))}
		</select>
	)
}

export function InputGroup ({ register, name, type, label, options, state, ...rest }: {
	register: UseFormRegister<any>,
	name: string,
	type?: React.HTMLInputTypeAttribute | 'select'
	label?: string,
	options?: string[],
	state?: { error?: FieldError | undefined, touched?: boolean | undefined },
	[x:string]: any
}) {

	let input: JSX.Element;
	switch(type) {
		case 'select':
			if (options) {
				input = <Select name={name} {...rest} register={register} options={options} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-900${state && state.touched && state.error ? ' border-red-500' : ''}`} />
				break;
			}
		default:
			input = <Input name={name} type={type} {...rest} register={register} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-900${state && state.touched && state.error ? ' border-red-500' : ''}`} />
	}

	return <div className='mb-4'>
		{label && <label htmlFor={name} className="block text-gray-900 text-sm font-medium mb-2">{label}</label>}
		{input}
		{state && state.touched && state.error && (
			<span className='text-red-500 text-sm italic'>{state.error.message}</span>
		)}
	</div>
}

export function FormSwitch({ enabled, setEnabled, description, ...rest }: { 
	enabled: boolean, 
	setEnabled: ()=>void, 
	description?: string
	[x:string]: any
}) {
	return (
		<Switch checked={enabled} disabled={enabled===undefined} onChange={setEnabled} className={`${enabled ? 'bg-teal-500 ' : 'bg-gray-600'}
			relative inline-flex cursor-pointer h-[38px] w-[74px] rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} {...rest}
		>
			{description && <span className='sr-only'>{description}</span>}
			{/* The toggle ball */}
			<span aria-hidden="true"
				className={`${enabled ? 'translate-x-7' : 'translate-x-0'}
					pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
			/>
		</Switch>
	)
}