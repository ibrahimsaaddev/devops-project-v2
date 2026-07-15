from flask import Flask, render_template, send_from_directory
import os
 
app = Flask(__name__)
 
 
@app.route("/")
def home():
    return render_template("index.html")
 
 
# Route to let visitors download my CV
@app.route('/download-cv')
def download_cv():
    return send_from_directory(directory='static', path='My_CV.pdf', as_attachment=True)
 
if __name__ == '__main__':
    app.run(debug=True)
