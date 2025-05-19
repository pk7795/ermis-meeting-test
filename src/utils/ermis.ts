import axios from 'axios'
import { env } from 'process'

export interface PeerSession {
  gateway: string
  room: string
  peer: string
  token: string
}

export const generateToken = async (room: string, peer: string, gateway: string, app_secret: string): Promise<string> => {
  try {
    const response = await axios.post(
      gateway + '/token/webrtc',
      { room, peer, ttl: 7200 },
      {
        headers: {
          Authorization: 'Bearer ' + app_secret,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.data?.token) {
      return response.data.data.token;
    } else {
      throw new Error(response.data.error_code || 'Unknown error');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.statusText);
    }
    throw error;
  }
}

export const generateWhipToken = async (room: string, peer: string, gateway: string, app_secret: string): Promise<string> => {
  try {
    const response = await axios.post(
      gateway + '/token/whip',
      {
        room,
        peer,
        ttl: 7200,
        record: true,
        extra_data: "string"
      },
      {
        headers: {
          Authorization: 'Bearer ' + app_secret,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.data?.token) {
      return response.data.data.token;
    } else {
      throw new Error(response.data.error_code || 'Unknown error');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.statusText);
    }
    throw error;
  }
}