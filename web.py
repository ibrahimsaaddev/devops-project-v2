import os
import time
from flask import Flask, render_template, request, jsonify
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import create_urllib3_context

# كلاس صايع عشان يجبر requests تستخدم بروتوكول SSL متوافق
class SSLAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = create_urllib3_context()
        context.load_default_certs()
        kwargs['ssl_context'] = context
        return super(SSLAdapter, self).init_poolmanager(*args, **kwargs)

app = Flask(__name__)

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

# تجهيز الـ Session وتطبيق حل الـ SSL
session = requests.Session()
session.mount("https://", SSLAdapter())
session.headers.update({"Authorization": f"Bearer {HF_TOKEN}"})

if not os.path.exists(os.path.join('static', 'images')):
    os.makedirs(os.path.join('static', 'images'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    data = request.get_json()
    user_prompt = data.get('prompt')
    
    if not user_prompt:
        return jsonify({'error': 'الرجاء إدخال نص لتوليد الصورة'}), 400

    try:
        payload = {"inputs": user_prompt}
        # بنستخدم الـ session المعدلة هنا بديل requests العادية
        response = session.post(API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            filename = f"image_{int(time.time())}.png"
            save_path = os.path.join('static', 'images', filename)
            
            with open(save_path, 'wb') as f:
                f.write(response.content)
            
            return jsonify({'success': True, 'image_url': f'/static/images/{filename}'})
        else:
            print(f"HuggingFace API Error: {response.status_code} - {response.text}")
            return jsonify({'error': f'API Error: {response.text}'}), 500

    except Exception as e:
        print(f"Internal Python Error: {str(e)}")
        return jsonify({'error': f'Server Exception: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
