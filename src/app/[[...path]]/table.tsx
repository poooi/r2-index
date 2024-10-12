'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortDirection,
  type SortingFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { filesize } from 'filesize'
import {
  ArrowDown,
  ArrowUp,
  FileArchiveIcon,
  FileCog,
  FileIcon,
  FolderIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'

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
import { cn } from '@/lib/utils'

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

const getSortedIcon = (direction: false | SortDirection): ReactNode => {
  if (!direction) {
    return null
  }
  if (direction === 'asc') {
    return <ArrowUp className="inline-block" />
  }
  return <ArrowDown className="inline-block" />
}

const sortByNumber: SortingFn<Data> = (rowA, rowB, columnId) => {
  if (rowA.original.type !== rowB.original.type) {
    return rowA.original.type === DataType.Folder ? 1 : -1
  }
  return rowA.getValue<number>(columnId) < rowB.getValue<number>(columnId)
    ? 1
    : -1
}

const sortByString: SortingFn<Data> = (rowA, rowB, columnId) => {
  if (rowA.original.type !== rowB.original.type) {
    return rowA.original.type === DataType.Folder ? 1 : -1
  }
  return rowA
    .getValue<string>(columnId)
    .localeCompare(rowB.getValue<string>(columnId), 'en', {
      sensitivity: 'base',
    })
}

export const IndexTable = ({ data }: TableProps) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('key', {
        sortingFn: sortByString,
        cell: (info) =>
          info.row.original.type === DataType.Folder ? (
            <Link
              href={info.row.original.href}
              className="inline-flex items-center gap-2"
              data-testid="folder-link"
            >
              <FolderIcon />
              {cleanFolderName(info.getValue())}
            </Link>
          ) : (
            <a
              href={info.row.original.href}
              className="inline-flex items-center gap-2"
              data-testid="file-link"
              download={cleanFileName(info.getValue())}
            >
              {guessFileIcon(info.getValue())}
              {cleanFileName(info.getValue())}
            </a>
          ),
        header: 'Name',
      }),
      columnHelper.accessor('size', {
        sortingFn: sortByNumber,
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
        sortingFn: sortByNumber,
        cell: (info) => {
          const timestamp = info.getValue()
          if (!timestamp) {
            return '-'
          }
          const date = new Date(timestamp)
          return <time dateTime={date.toISOString()}>{date.toISOString()}</time>
        },
        header: 'Modified',
      }),
    ],
    [],
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  })

  console.log(sorting)

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted()
              return (
                <TableHead
                  className="z-1 sticky top-0 bg-muted"
                  key={header.id}
                  aria-sort={
                    sorted === 'asc'
                      ? 'ascending'
                      : sorted === 'desc'
                        ? 'descending'
                        : 'none'
                  }
                >
                  <div
                    className={cn(
                      header.column.getCanSort() && 'cursor-pointer',
                      'hover:bg-accent hover:text-accent-foreground',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    role="button"
                    tabIndex={0}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {getSortedIcon(sorted)}
                  </div>
                </TableHead>
              )
            })}
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
