'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../store/store'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }
  const store = storeRef.current

  let subscriberCount = 0;
  const originalSubscribe = store.subscribe;
  store.subscribe = (listener) => {
    subscriberCount++;
    console.log('Current subscriber count:', subscriberCount);
    return originalSubscribe(listener);
  };
  return <Provider store={storeRef.current}>{children}</Provider>
}

