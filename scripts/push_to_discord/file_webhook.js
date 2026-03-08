#!/usr/bin/env node
import fetch from 'node-fetch';
import formData from 'form-data';
import fs from 'fs';
import docopt from "docopt";

const doc = `
Send a local file to a Discord webhook.

EXIT STATUS
    This utility exits with one of the following values:
    0   File sent successfully.
    >0  An error occurred.

Usage:
  file_webhook.js [options] <webhook_url> <filename>
  file_webhook.js (-h | --help)

Options:
  -h --help              Show this message.
`;

const options = docopt.docopt(doc, { version: "1.0.0" });
const webhook_url = options["<webhook_url>"];
const filename = options["<filename>"];

const form = new formData();
form.append('file1', fs.createReadStream(filename));

try {
    const res = await fetch(webhook_url, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`Discord responded with ${res.status} ${res.statusText}`);
        if (body) console.error(`Response body: ${body}`);
        process.exit(1);
    }

    console.log(`File sent successfully (${res.status} ${res.statusText})`);
} catch (err) {
    console.error(`Request failed: ${err.message}`);
    process.exit(1);
}