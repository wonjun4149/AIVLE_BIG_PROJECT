from google.cloud import translate_v2 as translate
import os

def translate_text(text, target_language):
    """Translates text into the target language."""
    # 서비스 계정 키 파일 경로 설정
    # Create_Terms.py와 동일한 경로의 인증 정보를 사용합니다.
    credentials_path = os.path.join(os.path.dirname(__file__), "aivle-team0721-79f3f908cb54.json")
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path

    translate_client = translate.Client()

    if isinstance(text, bytes):
        text = text.decode("utf-8")

    result = translate_client.translate(text, target_language=target_language)

    return result["translatedText"]
