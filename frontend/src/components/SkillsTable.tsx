'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import clsx from 'clsx'
import type { SkillMatch } from '@/types/resume'

const columnHelper = createColumnHelper<SkillMatch>()

const TYPE_CONFIG = {
  match: { label: '✅ Match', rowClass: 'bg-green-50' },
  gap: { label: '⚠️ Gap', rowClass: 'bg-red-50' },
  bonus: { label: '➕ Bonus', rowClass: 'bg-blue-50' },
} as const

interface SkillsTableProps {
  skills: SkillMatch[]
}

export default function SkillsTable({ skills }: SkillsTableProps) {
  const columns = [
    columnHelper.accessor('skill', {
      header: 'Skill',
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('inProfile', {
      header: 'In Your Profile',
      cell: (info) => (info.getValue() ? '✅' : '❌'),
    }),
    columnHelper.accessor('requiredByJob', {
      header: 'Required by Job',
      cell: (info) => (info.getValue() ? '✅' : '❌'),
    }),
    columnHelper.accessor('type', {
      header: 'Match',
      cell: (info) => (
        <span className="text-sm font-medium">
          {TYPE_CONFIG[info.getValue()].label}
        </span>
      ),
    }),
  ]

  const table = useReactTable({
    data: skills,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Skills Match Analysis</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-600"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  'border-b border-gray-100',
                  TYPE_CONFIG[row.original.type].rowClass,
                )}
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
