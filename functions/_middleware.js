export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();

  // Detecta únicamente adainvite.com/XVRegina (sin importar mayúsculas o minúsculas)
  const isReginaInvite = 
    url.pathname.toLowerCase() === "/xvregina" || 
    url.pathname.toLowerCase().startsWith("/xvregina/");

  // Si es cualquier otra invitación de AdaInvite, pasa directo sin tocar nada
  if (!isReginaInvite) {
    return context.next();
  }

  // Detecta si quien pide la vista previa es Instagram / Meta (y NO WhatsApp)
  const isInstagramOrMetaBot = 
    (userAgent.includes("facebookexternalhit") || 
     userAgent.includes("facebot") || 
     userAgent.includes("instagram")) && 
    !userAgent.includes("whatsapp");

  const response = await context.next();

  // Si es XVRegina en Instagram, elimina la imagen de vista previa
  if (isInstagramOrMetaBot) {
    return new HTMLRewriter()
      .on('meta[property="og:image"]', {
        element(element) {
          element.remove();
        }
      })
      .on('head', {
        element(element) {
          element.append('<meta name="robots" content="max-image-preview:none">', { html: true });
        }
      })
      .transform(response);
  }

  // En WhatsApp y navegadores normales, entrega el HTML original con su foto
  return response;
}
