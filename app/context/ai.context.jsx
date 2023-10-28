"use client"
import { createContext, useState } from "react";
import { useChat } from 'ai/react';


export const AiContext = createContext("something");

export default function AiProvider({children}) {

  const [chat, setChat] = useState("something");

  return (
    <AiContext.Provider value={chat}>
      {children}
    </AiContext.Provider>
  )
}
