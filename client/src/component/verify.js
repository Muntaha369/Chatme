import axios from "axios";

export const verify = ()=>{
  const token = localStorage.getItem('authToken');

  if(token){
    return "good to go"
  }
  else{
    return "not good"
  }
}