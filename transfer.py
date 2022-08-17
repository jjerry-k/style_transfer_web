import re
import base64
import cv2
import numpy as np
import tflite_runtime.interpreter as tflite

from utils import *

from PIL import Image
from io import BytesIO

def base64_to_pil(img_base64):
    """
    Convert base64 image data to PIL image
    """
    image_data = re.sub('data:image/.+;base64,', '', img_base64)
    byte_image = BytesIO(base64.b64decode(image_data))
    pil_image = Image.open(byte_image).convert("RGB")
    return byte_image, pil_image


def np_to_base64(img_np):
    """
    Convert numpy image (RGB) to base64 string
    """
    img = Image.fromarray(img_np.astype('uint8'), 'RGB')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    byte_image = buffered.getvalue()
    return u"data:image/png;base64," + base64.b64encode(byte_image).decode("ascii")

def preprocess_image(img, target_dim):
    img = img.resize((target_dim, target_dim))
    img = np.array(img)/255.
    img = np.expand_dims(img, axis=0)
    # img = cv2.resize(img, (target_dim, target_dim))
    return img.astype(np.float32)
    
# Set model path
style_predict_path = download_file('https://tfhub.dev/google/lite-model/magenta/arbitrary-image-stylization-v1-256/int8/prediction/1?lite-format=tflite', 'style_predict.tflite', './models/')
style_transform_path = download_file('https://tfhub.dev/google/lite-model/magenta/arbitrary-image-stylization-v1-256/int8/transfer/1?lite-format=tflite', 'style_transform.tflite', './models/')

interpreter_predict = tflite.Interpreter(model_path=style_predict_path)
interpreter_transform = tflite.Interpreter(model_path=style_transform_path)

def run_style_predict(preprocessed_style_image):
    # Set model input.
    interpreter_predict.allocate_tensors()
    input_details = interpreter_predict.get_input_details()
    interpreter_predict.set_tensor(input_details[0]["index"], preprocessed_style_image)

    # Calculate style bottleneck.
    interpreter_predict.invoke()
    style_bottleneck = interpreter_predict.tensor(interpreter_predict.get_output_details()[0]["index"])()

    return style_bottleneck

# Run style transform on preprocessed style image
def run_style_transform(style_bottleneck, preprocessed_content_image):

    # Set model input.
    input_details = interpreter_transform.get_input_details()
    interpreter_transform.allocate_tensors()

    # Set model inputs.
    interpreter_transform.set_tensor(input_details[0]["index"], preprocessed_content_image)
    interpreter_transform.set_tensor(input_details[1]["index"], style_bottleneck)
    interpreter_transform.invoke()

    # Transform content image.
    stylized_image = interpreter_transform.tensor(
        interpreter_transform.get_output_details()[0]["index"]
        )()

    return stylized_image