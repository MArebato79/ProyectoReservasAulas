const API = window.location.origin;

export async function authenticatedFetch(endpoint, method = 'GET', bodyData = null) {
    const currentToken=localStorage.getItem('jwtToken');

    const headers = {
        'Content-Type': 'application/json',
    };
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const config = { method: method, headers: headers };
    if (bodyData) {
        config.body = JSON.stringify(bodyData);
    }

    console.log(`[FETCH] Enviando ${method} a ${API}${endpoint}...`);

    try {
        const res = await fetch(`${API}${endpoint}`, config);
        console.log(`[FETCH] Respuesta recibida: Status ${res.status}`);

        if (res.status === 401) {
            console.error('ERROR 401: Sesión expirada o no autorizada.');
            localStorage.removeItem('jwtToken');
            return {error:'Sesión expirada'};
        }

        if (res.status === 204) {
            return { succes: true };
        }

        // [MEJORA] Leemos el texto primero para evitar errores de parsing
        const text = await res.text();

        try {
            // Intentamos parsear como JSON siempre
           const json = JSON.parse(text);
           if (!res.ok){
               return json.error ? json : { error: json.message || "Error desconocido" };
           }
           return json;
        } catch (e) {
            // Si falla el parseo, devolvemos el texto o un mensaje por defecto
            if (!res.ok) {
                return { error: text || `Error ${res.status}` };
            }
            return { message: text };
        }

    } catch (error) {
        return { error: 'Error de red o CORS al contactar con el servidor.' };
    }
}