import os
from supabase import create_client, Client
import numpy as np

surl = "https://exoxvaohgfvovezadgcx.supabase.co"
skey = "sb_publishable_k8YZIyxvEg56Fs-bUKy4dQ_7oSC9AK_"

supabase: Client = create_client(surl if surl else "", skey if skey else "")

data = np.random.random((1, 512))


res = supabase.table("files").update({"embedding": data.squeeze().tolist()}).eq(
    "s3key", "133831be61e5d4ff1d7ddf72465865d08211eaa43c1c80d91ecbdadfaeb5bf3a"
).execute()
print(res)
