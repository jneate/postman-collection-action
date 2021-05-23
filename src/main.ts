import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {promises} from 'fs'
import axios, {AxiosInstance, AxiosResponse} from 'axios'
import {
  LocalCollection,
  RemoteCollection,
  RemoteCollectionContainer
} from './types'

const localPostmanCollections: LocalCollection[] = []
const remotePostmanCollectionsMap: Map<string, RemoteCollection> = new Map()

const restClient: AxiosInstance = axios.create({
  baseURL: 'https://api.getpostman.com',
  timeout: 10000,
  headers: {
    'X-Api-Key': core.getInput('postmanApiKey')
  }
})

const postmanWorkspaceId = core.getInput('postmanWorkspaceId')

async function run(): Promise<void> {
  try {
    await Promise.all([
      loadLocalPostmanCollections(),
      loadRemotePostmanCollections()
    ])

    if (localPostmanCollections.length === 0) {
      // No local postman collections found so exit early
      return
    }

    await Promise.all(
      localPostmanCollections.map(async (localCollection: LocalCollection) => {
        try {
          const remoteCollection:
            | RemoteCollection
            | undefined = remotePostmanCollectionsMap.get(
            localCollection.info._postman_id
          )

          let response: AxiosResponse<RemoteCollectionContainer>

          if (!remoteCollection) {
            // Collection not found in Remote Workspace so send a POST Request to create the collection
            const createURi: string = postmanWorkspaceId
              ? `/collections?workspace=${postmanWorkspaceId}`
              : `/collections`
            response = await restClient.post(createURi, {
              collection: localCollection
            })
          } else {
            // This is the tricky bit, I don't want to compare if collections are different so always trigger the PUT Request
            // Consider using the GitHub Action trigger filters to only execute this action when json files change
            response = await restClient.put(
              `/collections/${remoteCollection.uid}`,
              {
                collection: localCollection
              }
            )
          }

          core.info(
            `Successfully ${
              remoteCollection ? 'updated' : 'created'
            } collection ${response.data?.collection?.name} with Postman ID ${
              response.data?.collection?.id
            }`
          )
        } catch (error) {
          core.error(
            `Status ${error.response?.status} - Unable to process collection ${localCollection.info.name} with Postman ID ${localCollection.info._postman_id} due to: ${error.response?.data?.error?.message}`
          )
          core.setFailed(
            `Errors processing Postman Collection(s) - Please see the output above`
          )
        }
      })
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function loadRemotePostmanCollections(): Promise<void> {
  try {
    const {data} = await restClient.get('/collections')
    for (const remoteCollection of data.collections.filter(
      (collection: RemoteCollection) => !collection.fork
    )) {
      remotePostmanCollectionsMap.set(remoteCollection.id, remoteCollection)
    }

    core.info(
      `${remotePostmanCollectionsMap.size} Non-Forked Collection(s) found for the given API Key in Remote Postman`
    )
  } catch (error) {
    core.setFailed(
      `Status ${error.response?.status} - Response: ${error.response?.data}`
    )
    throw new Error(`Unable to fetch Remote Collections from Postman Workspace`)
  }
}

async function loadLocalPostmanCollections(): Promise<void> {
  // Recursively search through the Repository files for JSON Files
  const jsonPattern = `**/*.json`
  const globber: glob.Globber = await glob.create(jsonPattern)
  const files: string[] = []

  for await (const file of globber.globGenerator()) {
    // Store the file name(s)
    files.push(file)
  }

  core.info(`${files.length} JSON File(s) Found`)

  if (files.length === 0) {
    return
  }

  // Wait for all files to be processed before progressing
  await Promise.all(
    files.map(async file => {
      // Read the file content in memory and convert to JSON
      try {
        const jsonContent = JSON.parse((await promises.readFile(file)).toString())
        // Check if the JSON file is a "valid" Postman v2.1 Collection, when true store in array
        if (
          jsonContent?.info?.schema ===
          `https://schema.getpostman.com/json/collection/v2.1.0/collection.json`
        ) {
          localPostmanCollections.push(jsonContent)
        }
      } catch (e) {
        // If JSON can't be parsed it's not valid so ignore
      }
    })
  )

  core.info(
    `${localPostmanCollections.length} JSON Postman Collection(s) found`
  )
}

run()
