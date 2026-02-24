image/DockerfileFROM public.ecr.aws/lambda/python:3.11

# # 1. Install system dependencies
# # mesa-libGL is often required by OpenCV/Pillow; libgomp is for ONNX performance
RUN yum install -y mesa-libGL libgomp && yum clean all

# 2. Set the working directory (AWS Lambda base image defaults to /var/task)
WORKDIR ${LAMBDA_TASK_ROOT}

# 3. Copy requirements.txt first
COPY requirements.txt .

# 4. Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 5. Copy your model and handler
COPY vismodel.onnx .
COPY models.py .
COPY lambda_function.py .

# 6. Set the CMD to your handler
CMD [ "lambda_function.lambda_handler" ]