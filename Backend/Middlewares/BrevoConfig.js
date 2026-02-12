const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// ⚠️ MUST be exactly "api-key"
console.log("Brevo API Key:", process.env.BREVO_API_KEY);
defaultClient.authentications["api-key"].apiKey =
    process.env.BREVO_API_KEY;

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = brevo;
