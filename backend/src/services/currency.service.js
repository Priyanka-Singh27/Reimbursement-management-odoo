const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

async function getCurrencyByCountry(countryName) {
  try {
    const response = await axios.get(
      `${env.countryApiBaseUrl}/name/${encodeURIComponent(countryName)}?fullText=true`
    );
    const country = response.data?.[0];
    const currencies = country?.currencies || {};
    const firstCurrencyCode = Object.keys(currencies)[0];

    if (!firstCurrencyCode) {
      throw new Error("Currency not found");
    }
    return firstCurrencyCode.toUpperCase();
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Unable to resolve country currency. Please verify country name."
    );
  }
}

async function convertCurrency(amount, from, to) {
  const source = from.toUpperCase();
  const target = to.toUpperCase();
  if (source === target) return amount;

  try {
    const response = await axios.get(
      `${env.exchangeApiBaseUrl}/latest?from=${source}&to=${target}`
    );
    const rate = response.data?.rates?.[target];

    if (!rate) {
      throw new Error("Rate missing");
    }

    return Number((amount * rate).toFixed(2));
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Unable to convert currency from ${source} to ${target}.`
    );
  }
}

module.exports = {
  getCurrencyByCountry,
  convertCurrency,
};
