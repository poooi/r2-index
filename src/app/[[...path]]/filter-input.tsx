'use client'

import { useAtom } from 'jotai'
import { FilterIcon } from 'lucide-react'

import { filterValue } from './states'

import { Input } from '@/components/ui/input'

export const FilterInput = () => {
  const [value, setValue] = useAtom(filterValue)
  return (
    <div className="relative my-2">
      <Input
        value={value}
        onChange={(ev) => setValue(ev.currentTarget.value)}
        placeholder="Filter"
        className="pr-4"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <FilterIcon className="text-muted-foreground" />
      </div>
    </div>
  )
}
