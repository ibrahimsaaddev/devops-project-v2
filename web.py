import os
import time
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

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
        response = requests.post(API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            filename = f"image_{int(time.time())}.png"
            save_path = os.path.join('static', 'images', filename)
            
            with open(save_path, 'wb') as f:
                f.write(response.content)
            
            return jsonify({'success': True, 'image_url': f'/static/images/{filename}'})
        else:
            return jsonify({'error': 'فشل الـ API في توليد الصورة، حاول مجدداً'}), 500

    except Exception as e:
        return jsonify({'error': 'حدث خطأ داخلي في السيرفر'}), 500

if __name__ == '__main__':
    app.run(debug=True)
