export async function onRequestPost({ request, env }) {
  const allowed = ["https://adainvite.com", "https://www.adainvite.com"];
  const origin = request.headers.get("Origin");
  if (origin && !allowed.includes(origin))
    return new Response("No permitido", { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  
  // SE AGREGÓ \/ PARA PERMITIR SUBCARPETAS
  const folder = String(form.get("folder") || "").replace(/[^\w-\/]/g, "");
  
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 2_000_000 || !folder)
    return new Response("Archivo inválido", { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  
  await env.BUCKET_FOTOS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });
  
  return Response.json({ url: `${env.PUBLIC_URL}/${key}` });
}
