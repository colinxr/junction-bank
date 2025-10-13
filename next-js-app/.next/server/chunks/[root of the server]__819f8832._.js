module.exports = {

"[project]/.next-internal/server/app/api/transactions/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route.runtime.dev.js [external] (next/dist/compiled/next-server/app-route.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}}),
"[project]/lib/prisma.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "prisma": (()=>prisma)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices
const globalForPrisma = global;
// Create the base client
const prismaBase = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : ("TURBOPACK unreachable", undefined)
});
// Only save prisma in global object in development (prevents memory leaks in prod)
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prismaBase;
// Export the client without extensions for now
const prisma = prismaBase;
;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/punycode [external] (punycode, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "createClient": (()=>createClient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    // This is the problem - cookies() needs a request context
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://eapovqvavqcyxaswqlpj.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcG92cXZhdnFjeXhhc3dxbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTM3NTUsImV4cCI6MjA1Nzk2OTc1NX0.xX3TLZ4cjyd-Ug4gWkJUnvF7n7hPdo44qJWuQFnD0e8"), {
        cookies: {
            get (name) {
                return cookieStore.get(name)?.value;
            },
            set (name, value, options) {
                try {
                    cookieStore.set({
                        name,
                        value,
                        ...options
                    });
                } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            },
            remove (name, options) {
                try {
                    cookieStore.set({
                        name,
                        value: '',
                        ...options
                    });
                } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
}}),
"[project]/lib/factories/transaction.factory.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "TransactionFactory": (()=>TransactionFactory)
});
class TransactionFactory {
    prisma;
    constructor(prisma){
        this.prisma = prisma;
    }
    async createTransaction(data) {
        // Handle currency conversion
        let { amount_cad, amount_usd } = data;
        if (!amount_cad && amount_usd) {
            // to do: get the exchange rate from the api
            amount_cad = Number((amount_usd * 1.3).toFixed(2));
        } else if (!amount_cad) {
            throw new Error("Either CAD or USD amount must be provided");
        }
        const transactionDate = new Date(data.date);
        const monthRecord = await this.getMonth(transactionDate);
        return {
            ...data,
            amount_cad,
            amount_usd: amount_usd ? Number(amount_usd.toFixed(2)) : null,
            date: transactionDate,
            monthId: monthRecord.id,
            userId: data.userId
        };
    }
    async getMonth(transactionDate) {
        const month = transactionDate.getMonth() + 1; // JavaScript months are 0-based
        const year = transactionDate.getFullYear();
        const monthRecord = await this.prisma.month.findFirst({
            where: {
                month,
                year
            }
        });
        if (!monthRecord) {
            throw new Error("Create the month first before creating a transaction");
        }
        return monthRecord;
    }
}
}}),
"[project]/lib/services/transaction.service.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "TransactionService": (()=>TransactionService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2f$transaction$2e$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/factories/transaction.factory.ts [app-route] (ecmascript)");
;
class TransactionService {
    prisma;
    transactionFactory;
    constructor(prisma){
        // Use the shared prisma client with middleware
        this.prisma = prisma;
        this.transactionFactory = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$factories$2f$transaction$2e$factory$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TransactionFactory"](prisma);
    }
    async getTransactions(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        // Build where clause for filtering
        const where = {};
        if (options?.startDate && options?.endDate) {
            where.date = {
                gte: options.startDate,
                lte: options.endDate
            };
        }
        // Get count for pagination
        const totalCount = await this.prisma.transaction.count({
            where
        });
        // Execute query with pagination and filtering
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                category: {
                    select: {
                        name: true,
                        id: true
                    }
                },
                month: {
                    select: {
                        month: true,
                        id: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            skip,
            take: limit
        });
        // Transform using more direct property access for performance
        const formattedTransactions = transactions.map((transaction)=>{
            const amountCad = parseFloat(transaction.amountCAD.toString());
            const amountUsd = transaction.amountUSD ? parseFloat(transaction.amountUSD.toString()) : null;
            const categoryName = transaction.category.name;
            const monthName = this.getMonthName(transaction.month.month);
            return {
                ...transaction,
                amount_cad: amountCad,
                amount_usd: amountUsd,
                category: categoryName,
                month: monthName
            };
        });
        return {
            data: formattedTransactions,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        };
    }
    async createTransaction(data) {
        // Get the formatted transaction data from factory
        const transactionData = await this.transactionFactory.createTransaction(data);
        // Create the transaction in the database
        try {
            const transaction = await this.prisma.transaction.create({
                data: {
                    name: transactionData.name,
                    type: transactionData.type,
                    amountCAD: transactionData.amount_cad,
                    amountUSD: transactionData.amount_usd,
                    date: transactionData.date,
                    notes: transactionData.notes || null,
                    userId: transactionData.userId,
                    monthId: transactionData.monthId,
                    categoryId: data.categoryId
                }
            });
            return transaction;
        } catch (error) {
            console.error('Transaction creation error:', error);
            throw new Error('Failed to create transaction');
        }
    }
    getMonthName(month) {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        return monthNames[month - 1];
    }
}
}}),
"[project]/app/api/transactions/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET),
    "POST": (()=>POST),
    "revalidate": (()=>revalidate)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$transaction$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/transaction.service.ts [app-route] (ecmascript)");
;
;
;
;
const transactionService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$transaction$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TransactionService"](__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"]);
const revalidate = 300;
async function GET(request) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const startDate = url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')) : undefined;
        const endDate = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')) : undefined;
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const result = await transactionService.getTransactions({
            page,
            limit,
            startDate,
            endDate
        });
        // Set cache control headers
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
            headers: {
                'Cache-Control': 'max-age=60, s-maxage=300, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Server error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { user } } = await supabase.auth.getUser();
        const transaction = await transactionService.createTransaction({
            ...body,
            userId: user?.id,
            categoryId: 11
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: transaction
        }, {
            status: 200
        });
    } catch (error) {
        console.error('Transaction creation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : 'Failed to create transaction'
        }, {
            status: 400
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__819f8832._.js.map