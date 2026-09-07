import { configureStore } from '@reduxjs/toolkit'
import authReducer from './Slice/auth'
import commentReducer from './Slice/comment'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    comment: commentReducer,
  },
})