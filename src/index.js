/**
 * Update Token Validation Credentials
 *
 * This example shows how a Cloudflare Workers cron trigger can be used to
 * automatically rotate a JWKs for a Token Configuration.
 *
 * To configure this Worker:
 *
 *   1. Replace `token_config_id` with the ID of the Token Config to update
 *   2. Replace `zone_id` with your Zone ID
 *   3. Replace `url` with a publicly accessible URL with the JWKs you want to use
 *   4. Create a new API Token with "Zone.API Gateway Edit" permissions and add it as a secret with the name `CF_API_TOKEN` (see https://developers.cloudflare.com/workers/configuration/secrets/)
 *
 * This worker also handles GET and POST requests:
 *   - GET will fetch and show the credentials from the provided URL (`GET https://random-worker-name-c134.example.workers.dev/`)
 *   - POST triggers an update and returns the Cloudflare API response of that update (`POST https://random-worker-name-c134.example.workers.dev/`)
 *
 * Use these methods can be used to test that the Worker is properly set up.
 *
 * After setting up the worker, you can create a cron trigger to run it periodically.
 * For more information on cron triggers, refer to https://developers.cloudflare.com/workers/configuration/cron-triggers/
 *
 * Learn more about Workers at https://developers.cloudflare.com/workers/
 */

var zone_id = "7daa530713d6ec22b68dad4e26f03bfb";
var token_config_id = "0222554b-4030-457f-97c8-2610c97875d8";
var url = "https://dev-tsyfsxtt.us.auth0.com/.well-known/jwks.json"; // JWKs

/**
 * fetchCredentials fetches new Token Configuration credentials using the URL defined above.
 * This returns a JSON string with the credentials.
 *
 * Use this function to fetch and parse credentials.
 *
 * @returns {string} credentials
 */
async function fetchCredentials() {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  const keys = await fetch(url, requestOptions)
    .then((e) => e.json())
    .then((e) => e.keys);
  return JSON.stringify({ keys: keys });
}

/**
 * updateCredentials updates Token Configuration credentials using the Cloudflare API.
 * Credentials are fetched using fetchCredentials, which also does any required processing.
 *
 * @param {string} bearer Cloudflare API Bearer token with "Zone.API Gateway Edit" permissions
 * @returns {string} Cloudflare API response from the update request
 */
async function updateCredentials(bearer) {
  // Cloudflare API endpoint for credentials update
  const url = `https://api.cloudflare.com/client/v4/zones/${zone_id}/api_gateway/token_validation/${token_config_id}/credentials`;
  const init = {
    body: await fetchCredentials(),
    method: "PUT",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "content-type": "application/json;charset=UTF-8",
    },
  };
  const response = await fetch(url, init);
  return response.text();
}

// Export a default object containing event handlers
export default {
  /**
   * fetch handles requests made directly to the Worker.
   *
   */
  async fetch(request, env, ctx) {
    let responseBody = "";
    if (request.method === "GET") {
      responseBody = await fetchCredentials();
    } else if (request.method === "POST") {
      responseBody = await updateCredentials(env.CF_API_TOKEN);
    }
    return new Response(responseBody, {
      headers: { "content-type": "application/json;charset=UTF-8" },
    });
  },

  /**
   * scheduled is the handler for cron triggers.
   *
   * For details, refer to https://developers.cloudflare.com/workers/configuration/cron-triggers/
   *
   */
  async scheduled(request, env, ctx) {
    ctx.waitUntil(updateCredentials(env.CF_API_TOKEN));
  },
};