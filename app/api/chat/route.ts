import { Configuration, OpenAIApi, ChatCompletionFunctions } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';


const functions: ChatCompletionFunctions[] = [
  {
    name: 'get_current_weather',
    description: 'Get the current weather',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        },
        format: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description:
            'The temperature unit to use. Infer this from the users location.'
        }
      },
      required: ['location', 'format']
    }
  },
  {
    name: 'get_weather_forecast',
    description: 'Get the weather forecast. take the average value from every day',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        },
        format: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description:
            'The temperature unit to use. Infer this from the users location.'
        },
        days: {
          type:'string',
          default: '7',
          description:"Number of Days the forecast should be searched for."
        }
      }
    }
  }
]

//`http://api.weatherapi.com/v1/future.json?key=${process.env.WEATHER_API_KEY}&q=${args.location}&dt=2023-09-10`
export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // tell the system to behave in an instructed way
  const systemMessage = {
    role: 'system',
    content: "You are a helpful assistant that provide what people ask for. You stick to the functions and the data / results they provide, you only reference this information, if asked for. You research as many Datapoints as possible for your final response."
  }
  messages.unshift(systemMessage);

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    stream: true,
    messages,
    functions
  })
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages
    ) => {
      // JSON.Object that holds the fetched data of each function that was called
      let respondedData = {};

      // if you skip the function call and return nothing, the `function_call`
      // message will be sent to the client for it to handle
      if (name === 'get_current_weather') {
        // API Call
        const getWeather = async () => {
            const weatherAPI = 
            `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${args.location}`
            const response = await fetch(weatherAPI);
            const data = await response.json();
          
            return data.current
        } 
        // extracting the data
        const response = await getWeather();
        const { temp_c, wind_kph, humidity, uv } = response;
        const { text: condition } = response.condition;

         const weatherDataCurrent = {
           temperature: `${temp_c}`,
           unit: args.format === 'celsius' ? 'C' : 'F',
           condition: `${condition}`,
           wind: `${wind_kph}`,
           humidity: `${humidity}`,
           uv: `${uv}`
         }
         
         // assign retrieved Data to Object that summarizes all the Data
         respondedData = {...respondedData, ...weatherDataCurrent}
         console.log(respondedData) ////////////////////
      }

      
      if (name === 'get_weather_forecast') {

        const getWeatherForecast = async () => {
          const weatherAPI = 
          `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${args.location}&days=${args.days}&aqi=no&alerts=no`
          const response = await fetch(weatherAPI);
          const data = await response.json();

          console.log("fetched[0]");


          return data.forecast
      } 
      // extracting the data
      const response = await getWeatherForecast();
                                                /**
                                                 * 
                                                 * 
                                                 * 
                                                 * FIX HOW YOU RETRIEVE THE DATA; IT IS NOT IN THE RIGHT FORMAT
                                                 * 
                                                 * 
                                                 * 
                                                 * 
                                                 */
      let weatherForecasts = {};
      console.log("response length " + response.length)
      for(let i = 0; i < response.length - 1; i++) {
        const { 
          avgtemp_c, 
          maxwind_kph, 
          avghumidity, 
          daily_chance_of_rain, 
          daily_chance_of_snow, 
          uv
        } = response[i].forecastday.day;
        const { date } = response[i].forecastday.date;
        const { text } = response[i].condition;

        const weatherDataForecast = {
          day: `${date}`,
          temperature: `${avgtemp_c}`,
          unit: 'C',
          condition: `${text}`,
          wind: `${maxwind_kph}`,
          humidity: `${avghumidity}`,
          rain_chance: `${daily_chance_of_rain}`,
          snow_chance: `${daily_chance_of_snow}`,
          uv: `${uv}`
        }
        
        weatherForecasts = {...weatherForecasts, ...weatherDataForecast}
        }
        console.log("weather forecast list " + weatherForecasts)

      // // assign retrieved Data to Object that summarizes all the Data
       respondedData = {...respondedData, ...weatherForecasts}
      // console.log(respondedData) ////////////////////
      }
      
        // `createFunctionCallMessages` constructs the relevant "assistant" and "function" messages for you
        const newMessages = createFunctionCallMessages(respondedData);

        return openai.createChatCompletion({
          messages: [...messages, ...newMessages],
          stream: true,
          model: 'gpt-3.5-turbo-0613',
          // "Recursive Function Calls"
          functions
        })

    }
  })
  // Respond with the stream
  return new StreamingTextResponse(stream)
}