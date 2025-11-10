export const createSlug = (str: string) => {
    return str
        .toString()                 // Convert to string
        .normalize("NFD")           // Normalize accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()              // Convert to lowercase
        .trim()                     // Remove whitespace from start/end
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, "");    // Remove leading/trailing hyphens
}

export const parseDate = (val: FormDataEntryValue | null) => {
    if (!val) return null;
    const date = new Date(val.toString());
    return isNaN(date.getTime()) ? null : date;
};

export const generateActivityDescription = (log: any): string => {
    const { action, modelName, user, recordId } = log;

    const actor = user?.fullName || "Someone";
    const entity = modelName || "Record";

    switch (action) {
        case "CREATE":
            return `${actor} created a new ${entity} (ID: ${recordId})`;
        case "UPDATE":
            return `${actor} updated ${entity} (ID: ${recordId})`;
        case "DELETE":
            return `${actor} deleted ${entity} (ID: ${recordId})`;
        case "COMMENT":
            return `${actor} commented on ${entity} (ID: ${recordId})`;
        case "REVIEW":
            return `${actor} reviewed ${entity} (ID: ${recordId})`;
        default:
            return `${actor} performed ${action?.toLowerCase()} on ${entity}`;
    }
}

export const charIconGen = (str: string) => {

    const char = str?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "?";

    return char;

}