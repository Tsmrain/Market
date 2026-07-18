const mapExpedido: Record<string, string> = {
    SC: "Santa Cruz",
    LP: "La Paz",
    CB: "Cochabamba",
    OR: "Oruro",
    PT: "Potosí",
    CH: "Chuquisaca",
    TJ: "Tarija",
    BE: "Beni",
    PD: "Pando"
};

export const obtenerNombreDepartamento = (codigo: string | undefined): string => {
    if (!codigo) return "";
    const cleanCodigo = codigo.trim().toUpperCase();
    return mapExpedido[cleanCodigo] || cleanCodigo;
};
