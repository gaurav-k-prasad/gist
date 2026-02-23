import { files } from "@/db/schema";
import { db } from "@/utils/db";
import { cosineDistance, desc, getColumns, gt, sql } from "drizzle-orm";

export async function findSimilarImage(query: string) {
  const embedding = await generateEmbedding(query);

  const similarity = sql<number>`1 - (${cosineDistance(files.embedding, embedding)})`;

  const similarGuides = await db
    .select({
      ...getColumns(files),
      similarity,
    })
    .from(files)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
}
