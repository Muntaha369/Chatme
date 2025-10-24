import { create } from 'zustand'

export const multiSocket = create((set) => ({
  Sockets: [],
  setSockets: (socket) => set(() => ({Sockets:socket})),
  removeSockets: (socket) => set((state)=>({Sockets:state.Sockets.filter(oldsocket=> oldsocket!= socket)}))
}))

export const useReciverId = create((set)=>({
  socketID:'',
  setSocketID:(socket)=>set(()=>({socketID:socket}))
}))

export const useDataroom = create((set)=>({
  dataRoom:[],
  // preferred API name used elsewhere in code:
  setDataRoom: (socket) => set((state) => ({ dataRoom: [socket, ...state.dataRoom] })),
  // // keep original name as alias for backwards-compatibility
  // setDataroom: (socket) => set((state) => ({ dataRoom: [socket, ...state.dataRoom] }))
}))

export const useUser = create((set)=>({
  user:"",
  setUser:(user) => set(() => ({user}))
}))

export const useUserID = create((set)=>({
  userID:"",
  setUserID:(userID) => set(() => ({userID}))
}))
