# Based on https://github.com/openai/CLIP/blob/main/clip/model.py

import onnxruntime
import numpy as np
from PIL import Image

def onnx_node_type_np_type(type):
    if type == "tensor(float)":
        return np.float32
    if type == "tensor(float16)":
        return np.float16
    if type == "tensor(int32)":
        return np.int32
    if type == "tensor(int64)":
        return np.int64
    raise NotImplementedError(f"Unsupported onnx type: {type}")

def ensure_input_type(input, type):
    np_type = onnx_node_type_np_type(type)
    if input.dtype == type:
        return input
    return input.astype(dtype=np_type)

class VisualModel:
    def __init__(self, path, providers=None):
        self.path = path
        print(f"Loading visual model: {path}")
        self.sess = onnxruntime.InferenceSession(path, providers=providers)
        self.input = self.sess.get_inputs()[0]
        self.output = self.sess.get_outputs()[0]
        
        if len(self.input.shape) != 4 or self.input.shape[2] != self.input.shape[3]:
            raise ValueError(f"unexpected shape {self.input.shape}")
        self.input_size = self.input.shape[2]
        print(f"Visual inference ready, input size {self.input_size}, type {self.input.type}")

    def encode(self, image_input):
        image_input = ensure_input_type(image_input, self.input.type)
        return self.sess.run([self.output.name], {self.input.name: image_input})[0]

    def fitted(self, size, w, h):
        short, long = (w, h) if w <= h else (h, w)
        new_short, new_long = size, int(size * long / short)
        new_w, new_h = (new_short, new_long) if w <= h else (new_long, new_short)
        return [new_w, new_h]
        
    def resize_to(self, img, size):
        new_size = self.fitted(size, img.width, img.height)
        return img.resize(size=new_size, resample=Image.Resampling.BICUBIC)

    def center_crop(self, img, size):
        image_height = img.height
        image_width = img.width
        if size > image_width or size > image_height:
            padding_ltrb = [
                (size - image_width) // 2 if size > image_width else 0,
                (size - image_height) // 2 if size > image_height else 0,
                (size - image_width + 1) // 2 if size > image_width else 0,
                (size - image_height + 1) // 2 if size > image_height else 0,
            ]
            img = img.pad(img, padding_ltrb, fill=0)
            image_width = img.width
            image_height = img.height
            if size == image_width and size == image_height:
                return img
        top = int(round((image_height - size) / 2.0))
        left = int(round((image_width - size) / 2.0))
        return img.crop((left, top, left + size, top + size))

    def to_numpy(self, pic):
        mode_to_nptype = {"I": np.int32, "I;16": np.int16, "F": np.float32}
        img = np.array(pic, mode_to_nptype.get(pic.mode, np.uint8), copy=True)
        if pic.mode == "1":
            img = 255 * img
        img = np.transpose(img, (2, 0, 1))
        img = img.astype(np.float32)
        img = np.divide(img, 255)
        return img

    def normalize(self, img):
        mean = np.array([0.48145466, 0.4578275, 0.40821073]).reshape((-1, 1, 1))
        std = np.array([0.26862954, 0.26130258, 0.27577711]).reshape((-1, 1, 1))
        return np.divide(np.subtract(img, mean), std)

    def preprocess(self, img):
        img = self.resize_to(img, self.input_size)
        img = self.center_crop(img, self.input_size)
        img = img.convert("RGB")
        img_np = self.to_numpy(img)
        img_np = self.normalize(img_np)
        return img_np

    def preprocess_images(self, images):
        preprocessed = []
        for img in images:
            if isinstance(img, str):
                img = Image.open(img)
            preprocessed.append(self.preprocess(img))
        return np.stack(preprocessed)
