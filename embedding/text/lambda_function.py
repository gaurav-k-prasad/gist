import os
from models import TextualModel
import json
from supabase import create_client, Client


surl = os.environ.get("SUPABASE_URL")
skey = os.environ.get("SUPABASE_KEY")
if not surl or not skey:
    raise ValueError("Supabase url or supabase key not found")

supabase: Client = create_client(surl, skey)
MODEL_PATH = os.path.join(os.environ.get("LAMBDA_TASK_ROOT", ""), "textmodel.onnx")

try:
    providers = ["CPUExecutionProvider"]
    textual = TextualModel(MODEL_PATH, providers=providers)
except Exception as e:
    print(f"Error loading model {e}")
    textual = None


def lambda_handler(event, context):
    if textual is None:
        return {"statusCode": 500, "body": "Model failed to initialize"}

    body = json.loads(event["body"])

    query = body.get("query")
    userId = body.get("userId")

    if query is None or userId is None:
        return {
            "statusCode": 400,
            "body": json.dumps(
                {
                    "success": False,
                    "message": "Required parameter(s) (Query, UserId) not found",
                }
            ),
        }

    try:
        texts_input = textual.tokenize([query])
        text_embeddings = textual.encode(texts_input).squeeze().tolist()
        rpc_res = supabase.rpc(
            "match_files",
            {
                "query_embedding": text_embeddings,
                "match_threshold": 0.4,
                "match_count": 5,
                "p_user_id": int(userId),
            },
        ).execute()
        print(rpc_res.data)

        return {
            "statusCode": 200,
            "body": json.dumps({"succeess": True, "data": rpc_res.data}),
        }
    except Exception as e:
        print("Error occured:", e)
        raise e
