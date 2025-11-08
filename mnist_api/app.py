from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os

try:
    from tflite_runtime.interpreter import Interpreter  # type: ignore
except ImportError:
    # Fallback for local development where tflite-runtime may not be installed.
    from tensorflow.lite.python.interpreter import Interpreter  # type: ignore

app = Flask(__name__)

# Configure CORS to allow requests from configured origin(s)
allowed_origin = os.getenv('API_ALLOWED_ORIGIN', '*')
CORS(app, resources={r"/predict": {"origins": allowed_origin}})

# Load the TensorFlow Lite model
interpreter = Interpreter(model_path='model.tflite')
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json(force=True)

        # Convert the input data into a NumPy array
        input_data = np.array(data)

        # Validate input shape
        if input_data.shape != (28, 28):
            return jsonify({'error': 'Invalid input shape. Expected a 28x28 matrix.'}), 400

        # Preprocess the input data
        input_data = input_data.reshape(1, 28, 28, 1).astype('float32')  # Add batch and channel dimensions

        # Make a prediction with the TFLite interpreter
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])
        predicted_class = int(np.argmax(predictions, axis=1)[0])

        # Return the prediction as JSON
        return jsonify({'prediction': predicted_class})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
