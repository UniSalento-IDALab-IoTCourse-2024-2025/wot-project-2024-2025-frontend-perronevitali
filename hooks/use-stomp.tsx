import { useEffect, useRef, useState } from 'react';
import { getStompClient, isStompReady } from '@/hooks/stompClient';

export function useStomp(idRabbit) {
  const clientRef = useRef(null);
  const [ready, setReady] = useState(isStompReady());

  useEffect(() => {
    if (!idRabbit) return;
    clientRef.current = getStompClient(idRabbit);

    const interval = setInterval(() => {
      if (isStompReady()) {
        setReady(true);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [idRabbit]);

  return { client: clientRef.current, ready };
}