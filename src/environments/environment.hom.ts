import { BACKEND_IP_ADDRESS_KEY, SSL_KEY } from "../app/shared/func-utils";

export const environment = {
  LOCAL: {
    BACKEND_URL: () => 'http://localhost:8080',
    BACKEND_WS: () => 'ws://localhost:8080',
  },
  PROD: {
    BACKEND_URL:  () => "http://api.sit.kugelbit.work/guess-game",
    BACKEND_WS: () => "ws://api.sit.kugelbit.work/guess-game"
  },
  CUSTOM: {
    BACKEND_URL: () => `${httpProtocol()}${localStorage.getItem(BACKEND_IP_ADDRESS_KEY)}`,
    BACKEND_WS: () => `${wsProtocol()}${localStorage.getItem(BACKEND_IP_ADDRESS_KEY)}`
  }

};

function httpProtocol() {
  return localStorage.getItem(SSL_KEY) ? "https://" : "http://"
}

function wsProtocol() {
  return localStorage.getItem(SSL_KEY) ? "wss://" : "ws://"
}
