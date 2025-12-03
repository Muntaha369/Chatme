import { create } from 'zustand'

export const multiSocket = create((set) => ({
  Sockets: [],
  setSockets: (newSocket) => set((state) => {
    const exists = state.Sockets.some((s) => s.data === newSocket.data);

    if (exists) {
      return {
        Sockets: state.Sockets.map((s) => 
          s.data === newSocket.data ? newSocket : s
        )
      };
    }

    return { 
      Sockets: [newSocket, ...state.Sockets] 
    };
  }),
}));

export const useReciverId = create((set)=>({
  socketID:'',
  setSocketID:(socket)=>set(()=>({socketID:socket}))
}))

export const useDataroom = create((set)=>({
  dataRoom:[],
  // preferred API name used elsewhere in code:
  // setDataRoom: (socket) => set((state) => ({ dataRoom: [socket, ...state.dataRoom] }))
  setDataRoom: (newRoom) => set((state) => {
    const exists = state.dataRoom.some((s)=> s === newRoom)

    if(exists){
      return
    }

    return {
      dataRoom:[newRoom, ...state.dataRoom]
    }

  })

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

export const useToggler = create((set)=>({
  toggler:false,
  setToggler:(boolean) => set(() => ({toggler:boolean}))
}))

export const useData = create((set)=>({
  allUsers:[],
  setallUsers:(users) => set(() => ({allUsers:users}))
}))

export const useContact = create((set) => ({
  contact: [],
  setContact: (newContact) => set((state) => ({contact: [newContact, ...state.contact] }))
}));

export const useReceiver = create((set) => ({
  receiverName: '',
  setReceiverName: (receiver) => set(() => ({receiverName: receiver}))
}));

export const useRoom = create((set) => ({
  RoomList:[],
  setRoomList: (newRoom) => set((state) => ({RoomList:[newRoom, ...state.RoomList]}))
}));

export const useRoomInfo = create((set) => ({
  roomInfo:[],
  setRoomInfo: (newRoom) => set((state) => ({roomInfo:[newRoom, ...state.roomInfo]}))
}));

export const useOpen = create((set)=>({
  isOpen:false,
  setOpen:(boolean) => set(()=>({isOpen:boolean}))
}))

export const useParticipants = create((set) => ({
  admin: '',
  coAdmin: [],
  participants: [],

  setParticipants1: (data) => {set(data)
    console.log("this is the data from store",data)
  } 
}));