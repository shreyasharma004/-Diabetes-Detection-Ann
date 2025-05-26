# -Diabetes-Detection-Ann
# 🧠 Diabetes Detection using Artificial Neural Network (ANN)

This project uses a simple Artificial Neural Network (ANN) to detect diabetes based on patient data from the Pima Indians dataset.

## 📊 Dataset

- **Source**: [Pima Indians Diabetes Dataset](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database)
- **Features**: Pregnancies, Glucose, Blood Pressure, Insulin, BMI, etc.

## 🧠 Model Summary

- Input: 8 features
- Layers:
  - Dense(16, ReLU)
  - Dense(8, ReLU)
  - Dense(1, Sigmoid)
- Loss: Binary Crossentropy
- Optimizer: Adam
- Accuracy: ~78%

## 🚀 How to Run

```bash
git clone https://github.com/shreyasharma004/diabetes-ann.git
cd diabetes-ann
python3 -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python3 diabetes_ann.py
