Streaming Data
It is often useful to send additional data alongside the model's response. For example, you may want to send status information, the message ids after storing them, or references to content that the language model is referring to.

The AI SDK provides a StreamData helper that allows you to stream additional data to the client and attach it either to the Message or to the data object of the useChat hook. The data is streamed as part of the response stream.

Sending Stream Data
In your server-side route handler, you can use StreamData in combination with streamText. You need to:

Initialize a StreamData object.
Append data to it, which can either be message annotations (appendMessageAnnotation) or call annotations (append) .
Close the StreamData object.
Return the StreamData object in the toDataStreamResponse call.
Here is an example:


import { openai } from '@ai-sdk/openai';
import { streamText, StreamData } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Create a new StreamData object
  const data = new StreamData();

  // Append to general streamed data
  data.append({ test: 'initialized calls' });

  const result = streamText({
    model: openai('gpt-4-turbo'),
    onFinish() {
      // message annotation:
      data.appendMessageAnnotation({
        id: generateId(), // e.g. id from saved DB record
        other: 'information',
      });

      // call annotation (can be any JSON serializable value)
      data.append('call completed');

      // close the StreamData object
      data.close();
    },
    messages,
  });

  // Respond with the stream and additional StreamData
  return result.toDataStreamResponse({ data });
}
You can also send stream data from custom backends, e.g. Python / FastAPI, using the Data Stream Protocol.

Stream Data in useChat
The useChat hook automatically processes the streamed data and makes it available to you.

Accessing Data
On the client, you can destructure data from the useChat hook which stores all StreamData as a JSONValue[].


import { useChat } from 'ai/react';

const { data } = useChat();
Accessing Message Annotations
Each message from the useChat hook has an optional annotations property that contains the message annotations sent from the server.

Since the shape of the annotations depends on what you send from the server, you have to destructure them in a type-safe way on the client side.

Here we just show the annotations as a JSON string:


import { Message, useChat } from 'ai/react';

const { messages } = useChat();

const result = (
  <>
    {messages?.map((m: Message) => (
      <div key={m.id}>
        {m.annotations && <>{JSON.stringify(m.annotations)}</>}
      </div>
    ))}
  </>
);
Updating and Clearing Data
You can update and clear the data object of the useChat hook using the setData function.


const { setData } = useChat();

// clear existing data
setData(undefined);

// set new data
setData([{ test: 'value' }]);

// transform existing data, e.g. adding additional values:
setData(currentData => [...currentData, { test: 'value' }]);
Example: Clear on Submit

'use client';

import { Message, useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, data, setData } =
    useChat();

  return (
    <>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

      {messages?.map((m: Message) => (
        <div key={m.id}>{`${m.role}: ${m.content}`}</div>
      ))}

      <form
        onSubmit={e => {
          setData(undefined); // clear stream data
          handleSubmit(e);
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </>
  );
}