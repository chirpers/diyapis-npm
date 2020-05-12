async function handledFetch(path, options) {
  const res = await fetch(path, options);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.startsWith('application/json')) {
    content = await res.json();
  } else {
    content = res.text();
  }

  if (res.status >= 400) {
    const err = new Error('Bad response from server');
    err.status = res.status;
    err.content = content;
    throw err;
  }
  return content;
}

function apiFetch(apiURL, path, options = {}) {
  let qs = '';
  const isFormData = options.body instanceof FormData;
  if (typeof options.body === 'object' && !isFormData) {
    options.body = JSON.stringify(options.body);
  }

  if (options.query) {
    const searchParams = new URLSearchParams();
    Object.keys(options.query).forEach((key) => {
      if (typeof options.query[key] !== 'undefined') {
        searchParams.append(key, options.query[key]);
      }
    });
    qs = `?${searchParams.toString()}`;
  }
  Object.assign(options, { credentials: 'include' });
  if (!isFormData) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }
  return handledFetch(`${options.api_url || apiURL}${path}${qs}`, options);
}

module.exports = {
  handledFetch,
  apiFetch
};
