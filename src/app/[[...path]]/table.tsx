'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { filesize } from 'filesize'
import { FileArchiveIcon, FileCog, FileIcon, FolderIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, type ReactNode } from 'react'

import { DataType, type Data } from './model'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableProps {
  data: Data[]
}

const columnHelper = createColumnHelper<Data>()

const cleanFileName = (name: string) => {
  return name.split('/').slice(-1).pop()!
}

const cleanFolderName = (name: string) => {
  return name.slice(0, -1).split('/').slice(-1).pop()!
}

const guessFileIcon = (name: string): ReactNode => {
  const ext = name.split('.').pop()
  switch (ext) {
    case 'zip':
    case 'rar':
    case '7z':
    case 'gz':
      return <FileArchiveIcon />
    case 'exe':
      return <FileCog />
    default:
      return <FileIcon />
  }
}

export const IndexTable = ({ data }: TableProps) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('key', {
        cell: (info) =>
          info.row.original.type === DataType.Folder ? (
            <Link
              href={info.row.original.href}
              className="inline-flex items-center gap-2"
            >
              <FolderIcon />
              {cleanFolderName(info.getValue())}
            </Link>
          ) : (
            <a
              href={info.row.original.href}
              className="inline-flex items-center gap-2"
            >
              {guessFileIcon(info.getValue())}
              {cleanFileName(info.getValue())}
            </a>
          ),
        header: 'Name',
      }),
      columnHelper.accessor('size', {
        cell: (info) =>
          info.getValue() ? (
            <span title={info.getValue()?.toString()}>
              {filesize(info.getValue()!)}
            </span>
          ) : (
            '-'
          ),
        header: 'Size(SI)',
      }),
      columnHelper.accessor('modified', {
        cell: (info) => (
          <time dateTime={info.getValue()?.toISOString()}>
            {info.getValue()?.toISOString()}
          </time>
        ),
        header: 'Modified',
      }),
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table className="table-auto">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="leading-8">
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        {table.getFooterGroups().map((footerGroup) => (
          <TableRow key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext(),
                    )}
              </th>
            ))}
          </TableRow>
        ))}
      </TableFooter>
    </Table>
  )
}
