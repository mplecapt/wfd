import { TRPCClientErrorLike } from '@trpc/client';
import React from 'react';
import { FieldError, FormState, UseFormRegister } from 'react-hook-form'

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