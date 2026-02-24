FROM public.ecr.aws/lambda/python:3.11

WORKDIR ${LAMBDA_TASK_ROOT}

COPY textmodel.onnx .
COPY vocab.txt.gz .

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY models.py .
COPY lambda_function.py .
COPY simple_tokenizer.py .

# Set the CMD to your handler
CMD [ "lambda_function.lambda_handler" ]