import { configureStore } from '@reduxjs/toolkit'
import  authSlice  from '@/lib/features/todos/authSlice'
import userSlice from '@/lib/features/todos/userSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      users: userSlice
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']