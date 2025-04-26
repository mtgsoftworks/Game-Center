// src/services/lobbyService.js
import axios from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getLobbies = async () => {
  const response = await axios.get('/lobbies');
  return response.data;
};

export const createLobby = async (lobbyData) => {
  const response = await axios.post('/lobbies', lobbyData);
  return response.data;
};

// Diğer CRUD işlemleri
export const updateLobby = async (id, lobbyData) => {
  const response = await axios.put(`/lobbies/${id}`, lobbyData);
  return response.data;
};

export const deleteLobby = async (id) => {
  const response = await axios.delete(`/lobbies/${id}`);
  return response.data;
};

export const joinLobby = async (lobbyId, password) => {
  const response = await axios.post(
    `${API_URL}/lobbies/join`,
    { lobbyId, password },
    { withCredentials: true }
  );
  return response.data;
};