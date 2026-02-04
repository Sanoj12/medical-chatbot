#medical chatbot - "DR.Chatbot"
 
## 1.app overview
A simple medical chatbot application where the user can ask medical-related questions and provide appropriate responses.user can only access with login 

## 2.target users
-age limit = above 15


## 3.features

##user features

1.login & signup
  
   -user can login with email or any other social media(facebook)
   -user can access only after login or signup
2.Chatbot page
   -welcome text view
   -chatbox
   - user can chat with her native language and response with give      language(translate option to english)
   -side bar with previous chat
3.ai response
  -Respond to greetings, simple questions
  -Use a simple rule-based AI or connect to an AI API (like OpenAI/Claude/Gemini)
 
4.optional features
   -dark mode toggle
   - save chat history locally(optional:firebase)



### 4. tech stack
 - frontend - nextjs(react)
 - styling(tailwind css)
 - backend/database - python backend fastapi
 -database(optional - firebase/localstorage)
 - deployment: vercel



### 5. pages/componnts
  1.'/' - login or signup
  2. '/chat' - chat interface

   
###components
 -chatwindows(show messages)
 -chatinput(input box + send button)
 -chat bubble(user vs bot messages)

  


### 6.ai/logic

-user login successfully with email or other social media
-user accesses chat page
-user sends a message
-system check:
   - check response(greetings, common questions)
   - if no match, forward to ai api(optional)
   - display ai response in chat  
-maintain chat history in state
-optional-store chat history in  localstorage