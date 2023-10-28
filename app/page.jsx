'use client'
 
import { useChat } from 'ai/react'
import Image from 'next/image';
import { useEffect } from 'react';
import weatherSVG from './assets/weather.svg'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  useEffect(() => {
      window.scrollTo(0, document.body.scrollHeight);
  }, [messages])

 
  return (
    <div className="h-screen justify-between w-3/4 md:max-w-3xl py-5 mx-auto flex flex-col sm:py-20">
      <Image src={weatherSVG} className='hovering mx-auto slideBottom' alt='sun behind cloud' />
      <div>
        {
          messages.length > 1 ? (
            <div className='flex-row justify-between rounded-md'>
            {messages.map((m) => (
              m.role === 'user' ? (
                <div key={m.id} className="glassUser text-black tracking-relaxed leading-relaxed p-3 mb-5 sm:mb-8 sm:p-5 shadow-xl">
                  {'😃 User: '}
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="glassAi text-black tracking-wider leading-relaxed p-5 mb-5 sm:mb-8 shadow-xl">
                  {'🤖 AI: '}
                  {m.content}
                </div>
              )
            ))}
            </div>
          ) : ( <h1 className="middlePosition fadeIn bg-orange-300 text-peach rounded-lg p-1 mb-5 sm:p-5">Say something...</h1> ) 
        }
      </div>
      <div className='slideBottom mr-auto py-2 bottom-3 flex-col w-full'>
        <form onSubmit={handleSubmit} className=' w-full'>
          <label>
            <input
              className="w-3/4 border border-gray-300 rounded shadow-xl p-2"
              value={input}
              onChange={handleInputChange}
            />
          </label>
            <button className="w-1/4 border border-grey-900 rounded shadow-xl p-2" type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}