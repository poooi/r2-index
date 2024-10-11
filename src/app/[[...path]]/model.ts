export enum DataType {
  File = 'file',
  Folder = 'folder',
}

export interface Data {
  key: string
  href: string
  type: DataType
  size?: number
  modified?: Date
}
