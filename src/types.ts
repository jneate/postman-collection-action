type RemoteCollectionFork = {
  label: string
  createdAt: Date
  from: string
}

export type RemoteCollection = {
  id: string
  name: string
  owner: string
  createdAt: Date
  updatedAt: Date
  uid: string
  isPublic: boolean
  fork: RemoteCollectionFork
}

export type RemoteCollectionContainer = {
  collection: RemoteCollection
}

type LocalCollectionInfo = {
  _postman_id: string
  name: string
  schema: string
}

export type LocalCollection = {
  info: LocalCollectionInfo
  item: unknown
}
