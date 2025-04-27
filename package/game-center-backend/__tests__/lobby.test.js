/**
 * @jest-environment node
 */
const request = require('supertest');

// Firebase ve Auth stubları
jest.mock('../utils/firebase', () => {
  const admin = {
    firestore: {
      FieldValue: { serverTimestamp: jest.fn(), delete: jest.fn() },
      Timestamp: { fromDate: date => date }
    }
  };
  const dataStore = [];
  const db = {
    collection: jest.fn(name => ({
      get: jest.fn(() => Promise.resolve({ docs: [] })),
      add: jest.fn(data => ({
        id: 'testId',
        get: () => Promise.resolve({ id: 'testId', data: () => data })
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [], empty: true }))
      })),
    }))
  };
  return { admin, db };
});

// Basit auth middleware stub
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { uid: 'testUid' };
  next();
});

// Controller stub'ları route testleri için
jest.mock('../controllers/lobbyController', () => ({
  getLobbies: jest.fn((req, res) => res.json([])),
  createLobby: jest.fn((req, res) => res.status(201).json({ id: 'testId', name: req.body.name, type: req.body.type, shareLink: `http://localhost:3000/lobbies/testId` })),
  updateLobby: jest.fn((req, res) => res.json({ id: req.params.id, name: req.body.name || 'Name', type: req.body.type || 'normal', shareLink: `http://localhost:3000/lobbies/${req.params.id}` })),
  deleteLobby: jest.fn((req, res) => res.json({ message: 'Lobby deleted.' })),
  joinLobby: jest.fn((req, res) => res.json({ message: 'Joined lobby.', lobby: { id: req.body.lobbyId } })),
  leaveLobby: jest.fn((req, res) => res.json({ message: 'Left lobby.', lobby: { id: req.body.lobbyId } })),
}));

// Test için minimal Express app oluştur
const express = require('express');
const bodyParser = require('body-parser');
const lobbyRoutes = require('../routes/lobby');
// Uygulama
const app = express();
app.use(bodyParser.json());
app.use('/api/lobbies', lobbyRoutes);

describe('Lobby API', () => {
  it('GET /api/lobbies should return array', async () => {
    const res = await request(app).get('/api/lobbies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/lobbies should create a lobby', async () => {
    const payload = { name: 'Test Lobby', type: 'normal' };
    const res = await request(app)
      .post('/api/lobbies')
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 'testId');
    expect(res.body).toHaveProperty('name', payload.name);
    expect(res.body).toHaveProperty('type', payload.type);
  });

  it('PUT /api/lobbies/:id should update a lobby', async () => {
    const payload = { name: 'New Lobby', type: 'event' };
    const res = await request(app).put('/api/lobbies/testId').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'testId');
    expect(res.body).toHaveProperty('name', payload.name);
    expect(res.body).toHaveProperty('type', payload.type);
    expect(res.body).toHaveProperty('shareLink', 'http://localhost:3000/lobbies/testId');
  });

  it('DELETE /api/lobbies/:id should delete a lobby', async () => {
    const res = await request(app).delete('/api/lobbies/testId');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Lobby deleted.');
  });

  it('POST /api/lobbies/join should join a lobby', async () => {
    const payload = { lobbyId: 'testId' };
    const res = await request(app).post('/api/lobbies/join').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Joined lobby.');
    expect(res.body.lobby).toHaveProperty('id', payload.lobbyId);
  });

  it('POST /api/lobbies/leave should leave a lobby', async () => {
    const payload = { lobbyId: 'testId' };
    const res = await request(app).post('/api/lobbies/leave').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Left lobby.');
    expect(res.body.lobby).toHaveProperty('id', payload.lobbyId);
  });
});
