"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMapToOutput = void 0;
const client_1 = require("@prisma/client");
const deepMapToOutput = (data) => {
    const convert = (value) => {
        if (value instanceof client_1.Prisma.Decimal)
            return Number(value);
        if (Array.isArray(value))
            return value.map(convert);
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value).reduce((acc, [k, v]) => ({
                ...acc,
                [k]: convert(v)
            }), {});
        }
        return value;
    };
    return convert(data);
};
exports.deepMapToOutput = deepMapToOutput;
