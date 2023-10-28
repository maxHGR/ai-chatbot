'use client'

import { AiProvider } from "../../context/ai.context"

const Providers = ({children}) => {
  return (
    <AiProvider>
      {children}
    </AiProvider>
  )
}

export default Providers;