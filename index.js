const mqtt = require('mqtt');
const { apiFetch } = require('./fetch');

function creatClient({ apiUrl = '', API_URL = '', appName = '', wsUrl = '' }) {
  let mqttClient;

  if (!apiUrl && !API_URL && !appName) {
    throw new Error('must have an apiURL, API_URL, or appName');
  }

  apiUrl = apiUrl || API_URL;
  if (!apiUrl) {
    apiUrl = `https://a.diyapis.com/${appName}`;
  }

  if (!appName) {
    appName = apiUrl.split('/')[apiUrl.split('/').length - 1];
  }

  if (!wsUrl) {
    const url = new URL(apiUrl);
    wsUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/${appName}`;
  }

  const client = {
    apiUrl,
    wsUrl,
    apiFetch: (path, options) => {
      return apiFetch(apiUrl, path, options);
    },
    connect: (url, options = {}) => {
      url = url || wsUrl;
      options = { username: appName, ...options };
      mqttClient = mqtt.connect(wsUrl, options);
      client.mqttClient = mqttClient;
      return mqttClient;
    },
    on: (...args) => {
      if (mqttClient) {
        return mqttClient.on(...args);
      }
    },
    subscribe: (...args) => {
      if (mqttClient) {
        return mqttClient.subscribe(...args);
      }
    },
    unsubscribe: (...args) => {
      if (mqttClient) {
        return mqttClient.unsubscribe(...args);
      }
    },
    close: (...args) => {
      if (mqttClient) {
        return mqttClient.close(...args);
      }
    },
    oauthStart: () => {
      return client.apiFetch('/users/oauth_start');
    },
    tokenLogin: (token) => {
      return client.apiFetch('/users/oauth_token', { method: 'POST', body: { token } });
    }
  };

  return client;
}

module.exports = {
  creatClient
};
