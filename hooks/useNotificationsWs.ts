import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { addNotification, setWsConnectionStatus } from '../store/slices/notificationSlice';

const SOCKET_URL = 'ws://10.0.2.2:9090/ws/notifications';

export const useNotificationsWs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      brokerURL: SOCKET_URL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      dispatch(setWsConnectionStatus(true));

      // Subscribe to user-specific notifications topic
      client.subscribe('/user/topic', (message) => {
        if (message.body) {
          const notificationData = JSON.parse(message.body);
          dispatch(addNotification(notificationData));
        }
      });
    };

    client.onWebSocketError = (error) => {
      console.error('Error with websocket', error);
      dispatch(setWsConnectionStatus(false));
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onDisconnect = () => {
      dispatch(setWsConnectionStatus(false));
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [dispatch, accessToken]);
};
