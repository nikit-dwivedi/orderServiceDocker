const axios = require("axios").default;
const res = require("express/lib/response");
require("dotenv").config();
const https = require('https')



const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function axiosResponse(response) {
  if (response.status == 200) {
    return response.data;
  } else {
    console.log(response.message);
    return false;
  }
}
module.exports = {
  post: async (endpoint, bodyData, headers) => {
    try {
      let config = {
        method: "post",
        url: endpoint,
        httpsAgent,
        headers: {
          "Content-Type": "application/json",
        },
        data: bodyData,
      };
      if (headers) {
        Object.assign(config.headers, headers)
      }
      let response = await axios(config)
      return axiosResponse(response);
    } catch (error) {
      return axiosResponse(error);
    }
  },
  get: async (endpoint, token) => {
    try {
      let config = {
        method: "get",
        url: endpoint,
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (token) {
        config.headers.Authorization = token
      }
      let response = await axios(config)
      return axiosResponse(response);
    } catch (error) {
      return axiosResponse(error);
    }
  },
  textLocalSms: async (number, otp) => {
    let config = {
      method: "get",
      url:
        `https://api.textlocal.in/send/?apikey=${textlocalapi}=&numbers=${number}&sender=FABLOP&message=` +
        encodeURIComponent(
          `Greetings from Fablo, ${otp} is your verification code to login into Fablo Platforms.`
        ),
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "1.0",
        "x-api-key": apiKey,
        Authorization: authorization,
      },
    };
    return axios(config)
      .then(function (response) {
        return axiosResponse(response);
      })
      .catch(function (error) {
        return axiosResponse(error);
      });
  },
};
