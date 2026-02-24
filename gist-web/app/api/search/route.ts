"use server";

import { auth } from "@/auth";
import { Sha256 } from "@aws-crypto/sha256-js";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const url = new URL(process.env.AWS_SEARCH_LAMBDA_URL!);

  // Check if there's a valid query
  if (!query || query.length > 100) {
    return NextResponse.json(
      { success: false, message: "Invalid query" },
      { status: 400 },
    );
  }
  const user = (await auth())?.user;

  // Check if user is authenticated
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 403 },
    );
  }

  const signer = new SignatureV4({
    service: "lambda",
    region: process.env.AWS_SEARCH_LAMBDA_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_SEARCH_LAMBDA_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SEARCH_LAMBDA_SECRET_KEY!,
    },
    sha256: Sha256,
  });

  const requestToSign = {
    method: "POST",
    hostname: url.hostname,
    path: url.pathname,
    protocol: url.protocol,
    headers: {
      "Content-Type": "application/json",
      host: url.hostname,
    },
    body: JSON.stringify({ query, userId: user.dbId }),
  };

  const signedRequest = await signer.sign(requestToSign);

  const response = await fetch(url.href, {
    method: signedRequest.method,
    headers: signedRequest.headers,
    body: signedRequest.body,
  });

  const data = await response.json();
  return Response.json(data);
}
