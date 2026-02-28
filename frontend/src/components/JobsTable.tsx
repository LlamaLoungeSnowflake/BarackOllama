'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import clsx from 'clsx'
import type { JobSuggestion } from '@/types/resume'

const columnHelper = createColumnHelper<JobSuggestion>()

function MatchBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={clsx('h-2 rounded-full transition-all', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{value}%</span>
    </div>
  )
}

interface JobsTableProps {
  jobs: JobSuggestion[]
}

export default function JobsTable({ jobs }: JobsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'matchPercent', desc: true },
  ])

  const columns = [
    columnHelper.accessor('title', {
      header: 'Job Title',
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('company', {
      header: 'Company',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('matchPercent', {
      header: 'Match',
      cell: (info) => <MatchBar value={info.getValue()} />,
    }),
    columnHelper.accessor('whyItFits', {
      header: 'Why It Fits',
      enableSorting: false,
      cell: (info) => (
        <span className="text-xs text-gray-600">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('requiredSkills', {
      header: 'Key Skills',
      enableSorting: false,
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((skill) => (
            <span
              key={skill}
              className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('applyUrl', {
      header: 'Apply',
      enableSorting: false,
      cell: (info) =>
        info.getValue() ? (
          <a
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Apply →
          </a>
        ) : null,
    }),
  ]

  const table = useReactTable({
    data: jobs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">🎯 Similar Job Opportunities</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={clsx(
                      'px-3 py-2 text-left text-xs font-medium text-gray-600 select-none',
                      header.column.getCanSort() && 'cursor-pointer hover:text-gray-900',
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ml-1 text-gray-400">
                        {header.column.getIsSorted() === 'asc'
                          ? '↑'
                          : header.column.getIsSorted() === 'desc'
                          ? '↓'
                          : '↕'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
