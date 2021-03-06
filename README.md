# bitabase - Manager
[![Build Status](https://travis-ci.org/bitabase/bitabase-manager.svg?branch=master)](https://travis-ci.org/bitabase/bitabase-manager)
[![David DM](https://david-dm.org/bitabase/bitabase-manager.svg)](https://david-dm.org/bitabase/bitabase-manager)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/bitabase/bitabase-manager)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/bitabase/bitabase-manager)](https://github.com/bitabase/bitabase-manager/blob/master/package.json)
[![GitHub](https://img.shields.io/github/license/bitabase/bitabase-manager)](https://github.com/bitabase/bitabase-manager/blob/master/LICENSE)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)

This is a very early attempt at an accounts management service.

## Getting Started
### From the CLI
Running the following:
```bash
npm install --global bitabase-manager
bitabase-manager --help
```

Will output the below:
```bash
📦 Bitabase-Manager - v2.2.1
The scalable, sharded database engine.
https://docs.bitabase.com

The following commands and arguments are available when starting Bitabase

Commands:
  start                                    Start the bitabase manager stack
    --bind-host                            Hostname to bind server to (default: 0.0.0.0)
    --bind-port                            Port to bind server to (default: 8001)
    --rqlite-addr                          Path to contact rqlite
    --secret                               The internal request secret
    --allow-cross-origin-domain            Allow a domain to bypass cross origin domain controls
    --password-hash-iterations             The iterations for the password hashing algorithm to use (default: 372791)

No command specified
```

You can start a bitabase server by running:

```bash
bitabase-manager start
```

### From NodeJS
```javascript
const bitabaseServer = require('bitabase-manager/server');

const server = bitabaseManager({
  bindHost: '0.0.0.0'
});

server.start();
```

## Endpoints

<table>
  <tr>
    <th></th>
    <th>Method</th>
    <th>Path</th>
    <th>Description</th>
  </tr>
  <tr>
    <td colspan=4>
      <strong>User</strong></br>
      Users are entities that can login to the manager api
    </td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">1.1</a></td>
    <td>POST</td>
    <td>/v1/users</td>
    <td>Create a new user</td>
  </tr>
  <tr>
    <td colspan=4>
      <strong>Sessions</strong></br>
      Sessions are created by users when they login
    </td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">2.1</a></td>
    <td>POST</td>
    <td>/v1/sessions</td>
    <td>Create a new session by logging in</td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">2.2</a></td>
    <td>GET</td>
    <td>/v1/sessions/current</td>
    <td>Get the user from the current session</td>
  </tr>
  <tr>
    <td colspan=4>
      <strong>Databases</strong></br>
      Databases are owned by one or more users and can store multiple collections
    </td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">3.1</a></td>
    <td>GET</td>
    <td>/v1/databases</td>
    <td>List all databases</td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">3.2</a></td>
    <td>POST</td>
    <td>/v1/databases</td>
    <td>Create a new database</td>
  </tr>
  <tr>
    <td colspan=4>
      <strong>Collections</strong></br>
      Collections are owned by a database and store records
    </td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">4.1</a></td>
    <td>GET</td>
    <td>/v1/databases/:databaseName/collections</td>
    <td>List all collections in a database</td>
  </tr>
  <tr>
    <td><a href="https://www.github.com/bitabase/bitabase-manager">4.2</a></td>
    <td>POST</td>
    <td>/v1/databases/:databaseName/collections</td>
    <td>Create a new collection in a database</td>
  </tr>
</table>

## License
This project is licensed under the terms of the AGPL-3.0 license.

