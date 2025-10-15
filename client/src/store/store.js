import { Socket } from 'socket.io-client'
import { create } from 'zustand'

export const multiSocket = create((set) => ({
  Sockets: [],
  setSockets: (socket) => set(() => ({Sockets:socket})),
  // Sockets: {
  //   uuuuiyt:{
  //     val:""
  //   }
  // },
  // setSockets: (socket) => set((state) => ({Sockets:socket})),
  removeSockets: (socket) => set((state)=>({Sockets:state.Sockets.filter(oldsocket=> oldsocket!= socket)}))
}))

export const useReciverId = create((set)=>({
  socketID:'',
  setSocketID:(socket)=>set(()=>({socketID:socket}))
}))


