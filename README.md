# JWK Worker
================

This is a Cloudflare Worker that updates Token Validation Credentials for a Token Configuration using a cron trigger.

## Configuration

To configure this Worker:

1. Replace `token_config_id` with the ID of the Token Config to update
2. Replace `zone_id` with your Zone ID
3. Replace `url` with a publicly accessible URL with the JWKs you want to use
4. Create a new API Token with "Zone.API Gateway Edit" permissions and add it as a secret with the name `CF_API_TOKEN` (see https://developers.cloudflare.com/workers/configuration/secrets/)

## Usage

This worker handles GET and POST requests:

* GET will fetch and show the credentials from the provided URL (`GET https://random-worker-name-c134.example.workers.dev/`)
* POST triggers an update and returns the Cloudflare API response of that update (`POST https://random-worker-name-c134.example.workers.dev/`)

You can also create a cron trigger to run the worker periodically. For more information on cron triggers, refer to https://developers.cloudflare.com/workers/configuration/cron-triggers/

## Learn more

Learn more about Workers at https://developers.cloudflare.com/workers/

## Development Notes

**Important:** When running Wrangler in a Docker development container, note that Wrangler listens on IPv6 only. To enable port forwarding, you will need to modify the `cli.js` file in the wrangler package to listen on all available network interfaces.

Specifically, change the line:
```javascript
server.listen(8976, "localhost");

```

to 

```javascript
server.listen(8976, "0.0.0.0");

```