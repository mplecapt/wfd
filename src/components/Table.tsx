import { useRef, useState } from "react"
import { useVirtual } from '@tanstack/react-virtual'
import { 
	ColumnDef, 
	Table, 
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable, 
	SortingState, 
	getSortedRowModel, 
	RowData,
	Row,
	Getter,
} from "@tanstack/react-table"

declare module '@tanstack/react-table' {
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: unknown) => void,
		removeRow: (rowIndex: number) => void,
		addRow: (newData: unknown) => void,
		dataRef: () => TData[],
	}
}

export function StyledTable<T>({ initialData, columns, getRowId }: {
	initialData: T[],
	columns: ColumnDef<T>[],
	getRowId: (row: T) => string
}) {
	const [data, setData] = useState<T[]>(initialData)
	const [sorting, setSorting] = useState<SortingState>([])
	
	const table = useReactTable({
		data,
		columns,
		getRowId,
		columnResizeMode: 'onChange',
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		meta: {
			updateData: (rowIndex, columnId, value) => {
				//skip auto reset index
				setData(old =>
					old.map((row, i) => {
						if (i === rowIndex) {
							return {
								...old[rowIndex]!,
								[columnId]: value,
							}
						}
						return row
					})
				)
			},
			removeRow: (rowIndex) => {
				setData(old => old.filter((row, i) => i !== rowIndex))
			},
			addRow: (newData) => {
				setData(old => [...old, newData as T])
			},
			dataRef: () => data
		}
	})

	const tableContainerRef = useRef<HTMLDivElement>(null)

	const { rows } = table.getRowModel()
	const rowVirtualizer = useVirtual({
		parentRef: tableContainerRef,
		size: rows.length,
		overscan: 10,
	})
	const { virtualItems: virtualRows, totalSize } = rowVirtualizer

	const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
	const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0
	
	return (<>
			<table className="w-full">
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<th key={header.id} colSpan={header.colSpan}
									className='bg-gray-700 p-2 relative'
									style={{ width: header.getSize() }}
								>
									{header.isPlaceholder
										? null
										: <>
											<div className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												{{ asc: ' 🔼', desc: ' 🔽'}[header.column.getIsSorted() as string] ?? null}
												{header.column.getCanFilter() ? (<>
														<span className="sm:inline-block hidden mr-3" />
														<input type='text' value={(header.column.getFilterValue() ?? '') as string}
															onChange={e => header.column.setFilterValue(e.target.value)}
															placeholder='Search...'
															className="text-gray-700 rounded w-3/4 border shadow font-normal px-1 sm:inline-block hidden"
														/>
												</>) : null}
											</div>
											<div
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												className={`absolute right-[-1px] top-0 h-full w-[3px] bg-gray-800 opacity-50 cursor-col-resize select-none touch-none ${header.column.getIsResizing() ? 'bg-blue-300 opacity-100' : ''}`}
											/>
										</>
									}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{paddingTop > 0 && (
						<tr>
							<td style={{ height: `${paddingTop}px`}} />
						</tr>
					)}
					{virtualRows.map(virtualRows => {
						const row = rows[virtualRows.index] as Row<T>
						return (
							<tr key={row.id}>
								{row.getVisibleCells().map(cell => (
									<td key={cell.id} style={{width: cell.column.getSize()}}
										className={`bg-gray-400`}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						)
					})}
					{paddingBottom > 0 && (
						<tr>
							<td style={{ height: `${paddingBottom}px`}} />
						</tr>
					)}
				</tbody>
			</table>
			{virtualRows.length === 0 && <p className="p-2">Nothing found</p>}
			{/* <div className="h-2" />
			<PageControl table={table} /> */}
	</>
	)
}

function PageControl({ table }: {
	table: Table<any>
}) {
	const buttonClass = 'border rounded p-1 leading-5 enabled:bg-green-300 enabled:hover:bg-green-400 enabled:text-gray-500'

	return (
		<div className="flex items-center gap-2">
			<button className={buttonClass} onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
				{'<<'}
			</button>
			<button className={buttonClass} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
				{'<'}
			</button>
			<button className={buttonClass} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
				{'>'}
			</button>
			<button className={buttonClass} onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
				{'>>'}
			</button>
			<span className="flex items-center gap-1">
				<div>Page</div><strong>{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</strong>
			</span>
			<span className="flex items-center gap-1">
				| Go to page:
				<input type='number' defaultValue={table.getState().pagination.pageIndex + 1} 
					onChange={e => {
						const page = e.target.value ? Number(e.target.value) - 1 : 0;
						if (page < table.getPageCount())
							table.setPageIndex(page); 
					}} 
					className='border p-1 rounded w-16 text-gray-600 h-7'
				/>
			</span>
			<select className="border rounded p-1 text-gray-600 h-7"
				value={table.getState().pagination.pageSize} 
				onChange={e => { table.setPageSize(Number(e.target.value)) }}
			>
				{[1, 10, 20, 30, 40, 50].map(pageSize => (
					<option key={pageSize} value={pageSize}>Show {pageSize}</option>
				))}
			</select>
		</div>
	)
}