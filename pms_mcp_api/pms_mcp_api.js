import fs from 'fs';
import fetch from 'node-fetch';

const collection = JSON.parse(
  fs.readFileSync('./PMS.postman.json')
);

export async function callApi(name, params) {
  const api = collection.item.find(i => i.name === name);

  const url = api.request.url.raw;
  const method = api.request.method;

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify(params)
  });

  return await res.json();
}