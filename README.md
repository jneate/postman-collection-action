# Postman Collection Action

This is a forked and modified version of https://github.com/jneate/postman-collection-action. This action now takes an additional input, specPath, to update a single Postman collection rather than multiple.

<p align="center">
  <a href="https://github.com/jneate/postman-collection-action/actions"><img alt="postman-collection-action status" src="https://github.com/jneate/postman-collection-action/workflows/build-test/badge.svg"></a>
</p>

This GitHub action will scan the repository contents for any Postman Collection JSON files and create or update the Collection in a specific [Postman Workspace](https://web.postman.co/workspace), the check to determine whether to create a new collection or update an existing one is based on the Collection ID, this is the `info._postman_id` field in an exported v2.1 collection.

If the Postman API returns a different Collection ID then the action will update the file, if you wish to commit this back into the Git repository then you can combine this action with `stefanzweifel/git-auto-commit-action@v4` which automatically commits the changed file(s). See the example usage sections below for more information.

>*Note: This action uses the `\t` character as formatting for the JSON document, the first commit might result in a large change due to this formatting character*

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

### postmanTimeout

**Optional** This is the number of milliseconds to wait for the Postman APIs to respond before timing out. *Default*: `15000`

### specPath

**Optional** Specify a single path to the spec you would like to use to update the collection.

**Note:** This will override local search functionality mentioned above

## Example Usage

### All Inputs

```yaml
- name: Checkout
  uses: actions/checkout@v2

- name: Sync Postman Collections
  uses: jneate/postman-collection-action@v1
  with:
    postmanApiKey: ${{ secrets.postmanApiKey }}
    postmanWorkspaceId: 0f41daa6-c9a7-49d9-8455-707e2f46da22
    postmanTimeout: 30000
```

### With Auto Git Commit

```yaml
- name: Checkout
  uses: actions/checkout@v2

- name: Sync Postman Collections
  uses: jneate/postman-collection-action@v1
  with:
    postmanApiKey: ${{ secrets.postmanApiKey }}
    postmanWorkspaceId: 0f41daa6-c9a7-49d9-8455-707e2f46da22
    postmanTimeout: 30000

- name: Commit Updated Postman Collection IDs
  uses: stefanzweifel/git-auto-commit-action@v4
  with:
    commit_message: Updated Postman Collection ID
```

### Required Only Inputs

```yaml
- name: Checkout
  uses: actions/checkout@v2

- name: Sync Postman Collections
  uses: jneate/postman-collection-action@v1
  with:
    postmanApiKey: ${{ secrets.postmanApiKey }}
```
