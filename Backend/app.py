from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS for all domains on all routes

# Load your model
model = load_model('diabetes_ann_model.h5')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Order of input features must match your model’s expected order
    features = [
        data['pregnancies'],
        data['glucose'],
        data['bloodPressure'],
        data['skinThickness'],
        data['insulin'],
        data['bmi'],
        data['diabetesPedigree'],
        data['age']
    ]
    # Reshape input for model (batch size 1)
    input_data = np.array([features])
    prediction = model.predict(input_data)
    # Prediction output can vary (adjust as per your model’s output)
    risk = float(prediction[0][0])
    return jsonify({'risk': risk})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
