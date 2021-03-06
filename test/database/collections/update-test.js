const http = require('http');

const test = require('tape');
const righto = require('righto');

const httpRequest = require('../../helpers/httpRequest');
const parseJsonBody = require('../../../modules/parseJsonBody');
const createMockRqliteServer = require('../../helpers/createMockRqliteServer');
const createServer = require('../../helpers/createServer');

const { createUserAndSession } = require('../../helpers/session');

const createDatabase = (headers, data) =>
  httpRequest('/v1/databases', {
    method: 'post',
    headers,
    data: data || {
      name: 'testing'
    }
  });

test('database collections: update a collection -> no session', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const response = await httpRequest('/v1/databases/unknown/collections/unknown', {
    method: 'put',
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 401);

  t.deepEqual(response.data, {
    errors: ['invalid session provided']
  });

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: update a collection -> no database', async t => {
  t.plan(1);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases/unknown/collections/unknown', {
    method: 'put',
    headers: session.asHeaders,
    data: {
      name: 'testing'
    }
  });

  t.equal(response.status, 404);

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: update a collection -> no post body', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);
  const server = await createServer();

  const session = await createUserAndSession();

  const response = await httpRequest('/v1/databases/unknown/collections/unknown', {
    method: 'put',
    headers: session.asHeaders
  });

  t.equal(response.status, 422);
  t.equal(response.data.error, 'no post body was provided');

  await server.stop();
  await mockRqlite.stop();
});

test('database collections: update existing collection', async t => {
  t.plan(5);
  const mockRqlite = await righto(createMockRqliteServer);

  const mockServer = http.createServer(function (request, response) {
    response.writeHead(404);
    response.end();
  });

  mockServer.listen(8005);

  const server = await createServer({
    servers: ['http://0.0.0.0:8005']
  });

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const createdCollection = await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const updatedCollection = await httpRequest('/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection',
      presenters: ['{...body one: 1}']
    }
  });

  const readCollection = await httpRequest('/v1/databases/testing/collections/testingcollection', {
    method: 'get',
    headers: session.asHeaders
  });

  await mockServer.close();
  await server.stop();
  await mockRqlite.stop();

  t.equal(createdCollection.status, 201);

  t.ok(createdCollection.data.id);
  t.ok(updatedCollection.data.presenters, 'presenters returned from update');
  t.equal(createdCollection.data.name, 'testingcollection');

  t.ok(readCollection.data.presenters, 'presenters existed when read collection again');
});

test('database collections: update existing collection can not change name', async t => {
  t.plan(2);
  const mockRqlite = await righto(createMockRqliteServer);

  const mockServer = http.createServer(function (request, response) {
    response.writeHead(404);
    response.end();
  });

  mockServer.listen(8005);

  const server = await createServer({
    servers: ['http://0.0.0.0:8005']
  });

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const updatedCollection = await httpRequest('/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    headers: session.asHeaders,
    data: {
      name: 'testingcollectionchanged',
      presenters: ['{...body one: 1}']
    }
  });

  await mockServer.close();
  await server.stop();
  await mockRqlite.stop();

  t.equal(updatedCollection.status, 400);
  t.ok(updatedCollection.data.name, 'name can not be changed');
});

test('database collections: update existing collection and sync server successfully', async t => {
  t.plan(7);
  const mockRqlite = await righto(createMockRqliteServer);

  const mockServer = http.createServer(async function (request, response) {
    const body = await parseJsonBody(request);
    t.equal(request.url, '/v1/databases/testing/collections/testingcollection');
    t.equal(body.name, 'testingcollection');
    t.deepEqual(body.presenters, ['{...body one: 1}']);
    response.end();
  });

  mockServer.listen(8005);

  const server = await createServer({
    servers: ['http://0.0.0.0:8005']
  });

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const createdCollection = await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const updatedCollection = await httpRequest('/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection',
      presenters: ['{...body one: 1}']
    }
  });

  await mockServer.close();
  await server.stop();
  await mockRqlite.stop();

  t.equal(createdCollection.status, 201);

  t.ok(createdCollection.data.id);
  t.ok(updatedCollection.data.presenters, 'presenters returned from update');
  t.equal(createdCollection.data.name, 'testingcollection');
});

test('database collections: update existing collection and sync server with failure', async t => {
  t.plan(4);
  const mockRqlite = await righto(createMockRqliteServer);

  const mockServer = http.createServer(function (request, response) {
    response.writeHead(404);
    response.end();
  });

  mockServer.listen(8005);

  const server = await createServer({
    servers: ['http://0.0.0.0:8005']
  });

  const session = await createUserAndSession();
  await createDatabase(session.asHeaders);

  const createdCollection = await httpRequest('/v1/databases/testing/collections', {
    method: 'post',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection'
    }
  });

  const updatedCollection = await httpRequest('/v1/databases/testing/collections/testingcollection', {
    method: 'put',
    headers: session.asHeaders,
    data: {
      name: 'testingcollection',
      presenters: ['{...body one: 1}']
    }
  });

  await mockServer.close();
  await server.stop();
  await mockRqlite.stop();

  t.equal(createdCollection.status, 201);

  t.ok(createdCollection.data.id);
  t.ok(updatedCollection.data.presenters, 'presenters returned from update');
  t.equal(createdCollection.data.name, 'testingcollection');
});
