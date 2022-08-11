import { TRPCClientErrorLike } from '@trpc/client';
import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form'

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