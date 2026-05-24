window.CatalogValidation = {
    ensureVisualMeta(items) {
        if (!Array.isArray(items)) return items;
        const defaults = window.BAContracts?.ItemVisualMetaDefaults || {
            iconKey: "question",
            stateHint: "buy",
            rarity: "common",
            badge: "none",
            frameStyle: "soft",
            previewVariant: "flat"
        };
        return items.map(item => {
            if (!item.visualMeta) item.visualMeta = {};
            item.visualMeta = {
                ...defaults,
                iconKey: item.visualMeta.iconKey || item.icon || defaults.iconKey,
                stateHint: item.visualMeta.stateHint || (item.consumable ? "stock" : "buy"),
                ...item.visualMeta
            };
            return item;
        });
    },

    validate(items) {
        if (!Array.isArray(items)) return [];
        const problems = [];
        const ids = new Set();
        items.forEach(item => {
            if (!item || !item.id) problems.push("Item sem id.");
            if (item?.id && ids.has(item.id)) problems.push(`Item duplicado: ${item.id}`);
            if (item?.id) ids.add(item.id);
            if (!item?.slot) problems.push(`Item sem slot: ${item?.id || "?"}`);
            if (typeof item?.price !== "number" || item.price < 0) problems.push(`Preco invalido: ${item?.id || "?"}`);
            if (!item?.visualMeta) problems.push(`Item sem visualMeta: ${item?.id || "?"}`);
            if (!item?.visualMeta?.iconKey) problems.push(`Item sem visualMeta.iconKey: ${item?.id || "?"}`);
            if (!item?.visualMeta?.stateHint) problems.push(`Item sem visualMeta.stateHint: ${item?.id || "?"}`);
        });
        if (problems.length) console.warn("CatalogValidation:", problems);
        return problems;
    },

    enforce(items) {
        const enriched = this.ensureVisualMeta(items);
        this.validate(enriched);
        return enriched;
    }
};
