import * as core from '@actions/core'
import * as glob from '@actions/glob'
import { readFile } from 'fs/promises'
import axios, { AxiosInstance } from 'axios'

async function run(): Promise<void> {
  try {
    // Recursively search through the Repository files for JSON Files
    const jsonPattern: string = `**/*.json`;
    const globber: glob.Globber = await glob.create(jsonPattern);
    const files: string[] = [];

    for await (const file of globber.globGenerator()) {
      // Store the file name(s)
      files.push(file);
    }

    const postmanCollections: Array<any> = [];

    core.debug(`${ files.length } JSON File(s) Found`);

    if (files.length === 0) {
      return;
    }

    // Wait for all files to be processed before progressing
    await Promise.all(files.map(async file => {
      // Read the file content in memory and convert to JSON
      try {
        const jsonContent = JSON.parse((await readFile(file)).toString());
        // Check if the JSON file is a "valid" Postman v2.1 Collection, when true store in array
        if (jsonContent?.info?.schema === `https://schema.getpostman.com/json/collection/v2.1.0/collection.json`) {
          postmanCollections.push(jsonContent);
        }
      } catch (e) {
        // If JSON can't be parsed it's not valid so ignore
      }
    }));

    core.debug(`${ postmanCollections.length } JSON Postman Collection(s) found`);

    if (postmanCollections.length === 0) {
      return;
    }

    const restClient: AxiosInstance = axios.create({
      baseURL: 'https://api.getpostman.com',
      timeout: 5000,
      headers: {
        "X-Api-Key": process.env.POSTMAN_API_KEY
      }
    });

    try {
      const { data } = await restClient.get('/collections');
      console.log(data); // TODO: Finish
    } catch (error) {
      core.setFailed(`Status ${error.response?.status} - Response: ${error.response?.data}`);
      return;
    }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
