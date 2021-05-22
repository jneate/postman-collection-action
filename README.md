<p align="center">
  <a href="https://github.com/jneate/postman-collection-action/actions"><img alt="postman-collection-action status" src="https://github.com/jneate/postman-collection-action/workflows/build-test/badge.svg"></a>
</p>

# Postman Collection Action

This GitHub action will scan the repository contents for any Postman Collection JSON files and create or update the Collection in a specific [Postman Workspace](https://web.postman.co/workspace), the check to determine whether to create a new collection or update an existing one is based on the Collection ID, this is the `info._postman_id` field in an exported v2.1 collection.

The local search process finds any `.json` files, attempts to parse them as valid JSON objects and then checks the `info.schema` field to match `https://schema.getpostman.com/json/collection/v2.1.0/collection.json`.

The following 4 Postman APIs are currently used:

- Get All Collections - GET - `https://api.getpostman.com/collections`
- Create a New Collection - POST - `https://api.getpostman.com/collections`
- Create a New Collection in a Workspace - POST - `https://api.getpostman.com/collections?workspace={{workspace_id}}`
- Update A Collections - `https://api.getpostman.com/collections/{{collection_uid}}`

## Inputs

### postmanApiKey

**Required** This is the postman API key you have created that has access to your workspace.

If you don't have an API Key, you can follow the instructions [here](https://learning.postman.com/docs/developer/intro-api/#generating-a-postman-api-key)

> *It's recommended to store this value in a secret so it's not visible in any log output / file content*

### postmanWorkspaceId

**Optional** This is the ID of the Workspace the collection should be created/updated in. *Default*: `My Workspace` which is associated to your API Key.

## Example Usage

### With Workspace ID Input

```yaml
- name: Checkout
  uses: actions/checkout@v2

- name: Sync Postman Collections
  uses: jneate/postman-collection-action@v1
  with:
    postmanApiKey: ${{ secrets.postmanApiKey }}
    postmanWorkspaceId: 0f41daa6-c9a7-49d9-8455-707e2f46da22
```

### Without Workspace ID Input

```yaml
- name: Checkout
  uses: actions/checkout@v2

- name: Sync Postman Collections
  uses: jneate/postman-collection-action@v1
  with:
    postmanApiKey: ${{ secrets.postmanApiKey }}
```
