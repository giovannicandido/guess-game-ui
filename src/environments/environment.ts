import { BACKEND_IP_ADDRESS_KEY, SSL_KEY } from "../app/shared/func-utils";

export const environment = {
  LOCAL: {
    BACKEND_URL: () => 'http://localhost:8080',
    BACKEND_WS: () => 'ws://localhost:8080',
  },
  PROD: {
    BACKEND_URL:  () => "https://guess-game-api-hom.gsilva.pro",
    BACKEND_WS: () => "wss://guess-game-api-hom.gsilva.pro"
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
