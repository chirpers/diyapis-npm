const mqtt = require('mqtt');
const { apiFetch } = require('./fetch');

function createClient({ apiUrl = '', API_URL = '', appName = '', wsUrl = '' }) {
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

  function getFullTopic(topic) {
    if (!topic) {
      return;
    }
    if (topic.startsWith('/')) {
      topic = topic.substring(1);
    }
    return `/${appName}/${topic}`;
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
      mqttClient.on('message', (topic, msg) => {
        try {
          msg = JSON.parse(msg.toString());
          mqttClient.emit('json', topic, msg);
        } catch (err) {
          // continue regardless of error
        }
      });
      return mqttClient;
    },
    on: (...args) => {
      if (mqttClient) {
        return mqttClient.on(...args);
      }
    },
    publish: (topic, payload, ...restArgs) => {
      topic = getFullTopic(topic);
      if (!topic || !mqttClient) {
        return;
      }

      if (typeof payload === 'object') {
        payload = JSON.stringify(payload);
      } else {
        payload = String(payload);
      }
      return mqttClient.publish(topic, payload, ...restArgs);
    },
    subscribe: (topic, ...args) => {
      topic = getFullTopic(topic);
      if (!topic || !mqttClient) {
        return;
      }
      return mqttClient.subscribe(topic, ...args);
    },
    unsubscribe: (topic, ...args) => {
      topic = getFullTopic(topic);
      if (!topic || !mqttClient) {
        return;
      }
      return mqttClient.subscribe(topic, ...args);
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
    },
    verifyUser: () => {
      return client.apiFetch('/users/me');
    }
  };

  return client;
}

module.exports = {
  createClient
};
