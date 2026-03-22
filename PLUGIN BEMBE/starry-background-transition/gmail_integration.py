from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

load_dotenv()

def get_gmail_service():
    creds = Credentials.from_authorized_user_info({
        'client_id': os.getenv('GOOGLE_CLIENT_ID'),
        'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
        'refresh_token': os.getenv('GOOGLE_REFRESH_TOKEN')
    }, ['https://www.googleapis.com/auth/gmail.readonly'])
    
    return build('gmail', 'v1', credentials=creds)

def check_new_emails():
    service = get_gmail_service()
    results = service.users().messages().list(
        userId='me',
        labelIds=['INBOX'],
        q="is:unread"
    ).execute()
    return results.get('messages', [])

if __name__ == "__main__":
    print("Emails no leídos:", len(check_new_emails()))