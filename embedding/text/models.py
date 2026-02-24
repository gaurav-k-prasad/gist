# Based on https://github.com/openai/CLIP/blob/main/clip/model.py

import onnxruntime
import numpy as np
from typing import List, Union

from simple_tokenizer import SimpleTokenizer


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


class TextualModel:
    def __init__(self, path, providers=None):
        self.path = path
        print(f"Loading textual model: {path}")

        self.sess = onnxruntime.InferenceSession(path, providers=providers)
        self.input = self.sess.get_inputs()[0]
        self.output = self.sess.get_outputs()[0]
        self.tokenizer = SimpleTokenizer()

        if len(self.input.shape) != 2 or self.input.shape[1] != 77:
            raise ValueError(f"unexpected shape {self.input.shape}")
        self.input_size = self.input.shape[1]
        print(
            f"Textual inference ready, input size {self.input_size}, type {self.input.type}"
        )

    def encode(self, texts):
        return self.sess.run([self.output.name], {self.input.name: texts})[0]

    def tokenize(
        self,
        texts: Union[str, List[str]],
        context_length: int = 77,
        truncate: bool = False,
    ) -> np.ndarray:
        """
        Returns the tokenized representation of given input string(s)

        Parameters
        ----------
        texts : Union[str, List[str]]
            An input string or a list of input strings to tokenize

        context_length : int
            The context length to use; all CLIP models use 77 as the context length

        truncate: bool
            Whether to truncate the text in case its encoding is longer than the context length

        Returns
        -------
        A two-dimensional tensor containing the resulting tokens, shape = [number of input strings, context_length].
        We return LongTensor when torch version is <1.8.0, since older index_select requires indices to be long.
        """
        if isinstance(texts, str):
            texts = [texts]

        sot_token = self.tokenizer.encoder["<|startoftext|>"]
        eot_token = self.tokenizer.encoder["<|endoftext|>"]
        all_tokens = [
            [sot_token] + self.tokenizer.encode(text) + [eot_token] for text in texts
        ]
        input_type = onnx_node_type_np_type(self.input.type)
        result = np.zeros(shape=(len(all_tokens), context_length), dtype=input_type)

        for i, tokens in enumerate(all_tokens):
            if len(tokens) > context_length:
                if truncate:
                    tokens = tokens[:context_length]
                    tokens[-1] = eot_token
                else:
                    raise RuntimeError(
                        f"Input {texts[i]} is too long for context length {context_length}"
                    )
            result[i, : len(tokens)] = np.array(tokens)

        return result
