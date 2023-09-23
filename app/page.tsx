'use client'
 
import { useChat } from 'ai/react'
import { useEffect } from 'react';
 
export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  useEffect(() => {
      window.scrollTo(0, document.body.scrollHeight);
  }, [messages])

 
  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {
        messages.length > 1 ? (
          messages.map(m => (
            m.role === 'user' ? (
              <div key={m.id} className="bg-teal-600 text-white rounded-lg p-3 mb-5">
                {'😃 User: '}
                {m.content}
              </div>
            ) : (
              <div key={m.id} className="bg-white-200 text-black rounded-lg p-3 mb-5">
                {'🤖 AI: '}
                {m.content}
              </div>
            )
          ))
        ) : ( <h1 className="bg-orange-300 text-peach rounded-lg p-3 mb-5">Say something...</h1> ) 
      }
      <form onSubmit={handleSubmit}>
        <label>
          <input
            className="fixed w-1/3 max-w-md bottom-0 border border-gray-300 rounded mb-12 shadow-xl p-2"
            value={input}
            onChange={handleInputChange}
          />
        </label>
        < br/>
        <div className="flex flex-col-reverse">
          <button className="fixed w-1/6 bottom-0 border border-grey-900 rounded mb-12 self-end shadow-xl p-2" type="submit">Send</button>
        </div>
      </form>
    </div>
  )
}