# diyapis

[![NPM](https://nodei.co/npm/diyapis.png?compact=true)](https://nodei.co/npm/diyapis/)  [![CircleCI](https://circleci.com/gh/chirpers/diyapis-npm.svg?style=svg)](https://circleci.com/gh/chirpers/diyapis-npm)

Client helper library for [diyapis.com](https://diyapis.com) - the Do-it-Yourself API creator.



## Installation

`npm install diyapis`


## Using in your client-side code:
```javascript
import { createClient } from 'diyapis';

const client = createClient({appName: 'test'});

//call one of your API functions
client.apiFetch('/myTest')
  .then((result) => {
    console.log(result);
  });

// connect to the diyapis mqtt broker after authenticating to the API
client.connect();

// listen for mqtt messages
client.on('message', (topic, msg) => {
  console.log(msg);
});

```
