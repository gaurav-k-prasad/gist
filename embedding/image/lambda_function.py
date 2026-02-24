import json
import urllib.parse
import boto3
import os
import urllib
from models import VisualModel
from supabase import create_client, Client

surl = os.environ.get("SUPABASE_URL")
skey = os.environ.get("SUPABASE_KEY")
if not surl or not skey:
    raise ValueError("Supabase url or supabase key not found")

supabase: Client = create_client(surl, skey)

s3 = boto3.client("s3")
MODEL_PATH = os.path.join(os.environ.get("LAMBDA_TASK_ROOT", ""), "vismodel.onnx")


try:
    providers = ["CPUExecutionProvider"]
    visual = VisualModel(MODEL_PATH, providers=providers)
except Exception as e:
    print(f"Error loading model: {e}")
    visual = None


def lambda_handler(event, context):
    local_path = None

    if visual is None:
        return {
            "statusCode": 500,
            "body": json.dumps(
                {"success": False, "message": "Model failed to initialize"}
            ),
        }

    try:
        bucket = event["Records"][0]["s3"]["bucket"]["name"]
        key = event["Records"][0]["s3"]["object"]["key"]
        key = urllib.parse.unquote_plus(key)

        local_path = f"/tmp/{os.path.basename(key)}"

        # 1. Download from S3
        s3.download_file(bucket, key, local_path)

        # 2. Inference
        images_input = visual.preprocess_images([local_path])
        image_embeddings = visual.encode(images_input)

        res = (
            supabase.table("files")
            .update({"embedding": image_embeddings.squeeze().tolist()})
            .eq("s3key", key)
            .execute()
        )

        if len(res.data) == 0:
            raise Exception("No objects updated")

        print(f"Saved {key}")
        return {
            "statusCode": 200,
            "body": json.dumps({"success": True}),
        }
    except Exception as e:
        print(f"Runtime error: {e}")
        raise e
    finally:
        # 3. Clean up disk
        if local_path and os.path.exists(local_path):
            os.remove(local_path)
