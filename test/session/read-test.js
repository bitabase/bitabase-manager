const test = require('tape');
const righto = require('righto');

const httpRequest = require('../helpers/httpRequest');

const createMockRqliteServer = require('../helpers/createMockRqliteServer');
const createServer = require('../helpers/createServer');

const createUser = (user) =>
  httpRequest('/v1/users', {
    method: 'post',
    data: user || {
      email: 'test@example.com',
      password: 'password'
    }
  });

const createSession = (user) =>
  httpRequest('/v1/sessions', {
    method: 'post',
    data: user || {
      email: 'test@example.com',
      password: 'password'
    }
  });

test('session: read a not existing session', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const response = await httpRequest('/v1/sessions/current', {
    method: 'get',
    headers: {
      'X-Session-Id': 'wrongid',
      'X-Session-Secret': 'wrongsecret'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    error: 'unauthorised'
  });

  await server.stop();
  await mockRqlite.stop();
});

test('session: read an existing session with wrong secret', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  await createUser();
  const session = (await createSession()).data;

  const response = await httpRequest('/v1/sessions/current', {
    method: 'get',
    headers: {
      'X-Session-Id': session.sessionId,
      'X-Session-Secret': 'wrongsecret'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    error: 'unauthorised'
  });

  await server.stop();
  await mockRqlite.stop();
});

test('session: read an existing session with correct details', async t => {
  t.plan(4);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const user = (await createUser()).data;
  const session = (await createSession()).data;

  const response = await httpRequest('/v1/sessions/current', {
    method: 'get',
    headers: {
      'X-Session-Id': session.sessionId,
      'X-Session-Secret': session.sessionSecret
    }
  });

  t.equal(response.status, 200);

  t.equal(response.data.sessionId, session.sessionId);
  t.equal(response.data.user.id, user.id);
  t.notOk(response.data.user.password);

  await server.stop();
  await mockRqlite.stop();
});
