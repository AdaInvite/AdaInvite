export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();

  // 1. Aplica únicamente a adainvite.com/XVRegina
  const isReginaInvite = 
    url.pathname.toLowerCase() === "/xvregina" || 
    url.pathname.toLowerCase().startsWith("/xvregina/");

  if (!isReginaInvite) {
    return context.next();
  }

  // 2. Detecta solo el bot que genera vistas previas de Instagram / Meta (NO WhatsApp ni usuarios reales)
  const isInstagramPreviewBot = 
    (userAgent.includes("facebookexternalhit") || 
     userAgent.includes("facebot") || 
     userAgent.includes("meta-externalagent")) && 
    !userAgent.includes("whatsapp");

  // 3. Si es el bot de vista previa de Instagram, devolvemos respuesta vacía (204)
  // Esto evita cualquier cuadro gris, imagen, texto suelto o icono de carga
  if (isInstagramPreviewBot) {
    return new Response(null, { status: 204 });
  }

  // En WhatsApp y cuando cualquier persona abre el link, carga la invitación intacta
  return context.next();
}
