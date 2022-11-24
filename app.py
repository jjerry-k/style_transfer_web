# Flask
from flask import Flask, request, render_template, jsonify

# Some utilites
from transfer import *

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    # Main page
    return render_template('index.html')

@app.route('/transfer', methods=['GET', 'POST'])
def transfer():
    if request.method == 'POST':
        
        # Get the image from post request
        _, content_img = base64_to_pil(request.json["Content-Image"])
        _, style_img = base64_to_pil(request.json["Style-Image"])
        # print("Image Loaded !")

        origin_width, origin_height = content_img.size
        # Preprocess the input images.
        preprocessed_content_image = preprocess_image(content_img, 384)
        preprocessed_style_image = preprocess_image(style_img, 256)

        # Calculate style bottleneck for the preprocessed style image.
        style_bottleneck = run_style_predict(preprocessed_style_image)

        # Stylize the content image using the style bottleneck.
        stylized_image = (run_style_transform(style_bottleneck, preprocessed_content_image)*255).astype(np.uint8)[0]
        stylized_image = cv2.resize(stylized_image, (origin_width, origin_height)).astype(np.uint8)
        
        # Serialize the result, you can add additional fields
        transfer_image = np_to_base64(stylized_image)
        return jsonify(result=transfer_image)

    return None

if __name__ == '__main__':
    print("Run Server !")
    # Serve the app with gevent
    app.run(host='0.0.0.0', port=5000)