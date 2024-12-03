const tf = require('@tensorflow/tfjs-node'); 

async function loadModel() {
    const model = await tf.loadLayersModel('./models/capstone_model.h5');
    console.log("Model loaded successfully!");
    return model;
}
