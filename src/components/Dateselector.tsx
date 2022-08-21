import Datepicker, { ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import { forwardRef } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { format } from 'date-fns'

export function DateSelector({ selected, onChange, expired }: {
	selected?: Date | undefined | null,
	onChange?: (date: Date) => void,
	expired?: boolean
}) {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return (
			<Datepicker
				selected={selected}
				onChange={date => date !== null && onChange && onChange(date)}
				minDate={today}
				nextMonthButtonLabel='>'
				previousMonthButtonLabel='<'
				popperClassName='react-datepicker-left'
				customInput={<ButtonInput expired={expired} />}
				renderCustomHeader={CalendarHeader}
				dayClassName={(date) => {
					date.setHours(0, 0, 0, 0)
					return `${date.getTime() === today.getTime() && 'border-2 border-blue-300'} hover:bg-green-300 hover:text-gray-600 cursor-pointer`}
				}
			/>
	)
}

function CalendarHeader({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }: ReactDatePickerCustomHeaderProps) {
	return (
		<div className='flex items-center justify-between px-2 py-2'>
			<span className='text-lg text-gray-700'>{format(date, 'MMMM yyyy')}</span>
			<div className='space-x-2'>
				<button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} type='button'
					className={`${prevMonthButtonDisabled && 'cursor-not-allowed opacity-50'} inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500`}
				><ChevronLeftIcon className='w-5 h-5 text-gray-600' /></button>
				<button onClick={increaseMonth} disabled={nextMonthButtonDisabled} type='button'
					className={`${nextMonthButtonDisabled && 'cursor-not-allowed opacity-50'} inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500`}
				><ChevronRightIcon className='w-5 h-5 text-gray-600' /></button>
			</div>
		</div>
	)
}

const ButtonInput = forwardRef<HTMLButtonElement, { value?: any, onClick?: any, expired?: boolean }>(
	({ value, onClick, expired }, ref) => (
		<button
				onClick={onClick}
				ref={ref}
				type="button"
				className={`inline-flex justify-start w-full px-3 py-2 text-sm font-normal hover:bg-blue-100 hover:text-gray-500 text-white rounded-md ${expired && 'bg-red-300'}`}
		>
			<CalendarIcon className='h-5 w-auto mr-2'/>
			<span>{value || '--/--/----'}{expired && ' !!'}</span>
		</button>
	)
)
ButtonInput.displayName = 'DateButton'