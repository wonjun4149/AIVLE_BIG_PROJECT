from vertexai.preview.language_models import ChatModel
import vertexai
from google.oauth2 import service_account

PROJECT_ID = "aivle-team0721"
LOCATION = "us-central1"
SERVICE_ACCOUNT_FILE = "/Users/wonjun/Desktop/Bigproject/AIVLE_BIG_PROJECT-1/ai/src/main/Python/aivle-team0721-a14daf2bc8a8.json"

credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)



chat_model = ChatModel.from_pretrained("chat-bison@002")
chat = chat_model.start_chat()
response = chat.send_message("안녕!")
print(response.text)
