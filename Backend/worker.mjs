import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const connectDB = require("./Modals/db");
const { signup, login, logout, getProfile, changePassword, updateUser } = require("./Controllers/AuthController");
const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  getAllproducts,
} = require("./Controllers/ProductController");
const {
  createKhata,
  getAllKhatas,
  getKhataById,
  updateKhata,
  deleteKhata,
  addTransaction,
  getTransactionsByKhata,
  getKhataByPhone,
} = require("./Controllers/khataController");
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByDate,
} = require("./Controllers/InvoiceController");
const ensureAuthenticated = require("./Middlewares/Auth");
const {
  signupValidation,
  loginValidation,
  productValidation,
  updateProductValidation,
  bulkUpdateValidation,
  createKhataValidation,
  updateKhataValidation,
  idValidation,
  invoiceValidation,
} = require("./Middlewares/AuthValidation");
const Settings = require("./Modals/Setting");
const contactRoutes = require("./Routes/contactRoutes");

const contactHandler = contactRoutes.contactHandler;

const parseAllowedOrigins = (value = "") =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const applyCorsHeaders = (response, origin, allowedOrigins) => {
  const headers = new Headers(response.headers);
  const allowAll = allowedOrigins.length === 0;

  if (allowAll) {
    headers.set("Access-Control-Allow-Origin", origin || "*");
  } else if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const matchRoute = (pattern, pathname) => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};

  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
};

const routes = [
  { method: "GET", path: "/ping", handlers: [async (_req, res) => res.send("pong")] },

  { method: "POST", path: "/auth/logout", handlers: [logout] },
  { method: "POST", path: "/auth/login", handlers: [loginValidation, login] },
  { method: "POST", path: "/auth/signup", handlers: [signupValidation, signup] },
  { method: "GET", path: "/auth/getProfile", handlers: [ensureAuthenticated, getProfile] },
  { method: "PUT", path: "/auth/changePassword", handlers: [ensureAuthenticated, changePassword] },
  { method: "PUT", path: "/auth/update", handlers: [ensureAuthenticated, updateUser] },

  { method: "POST", path: "/products", handlers: [ensureAuthenticated, productValidation, createProduct] },
  { method: "GET", path: "/products", handlers: [ensureAuthenticated, getProducts] },
  { method: "GET", path: "/products/all", handlers: [getAllproducts] },
  { method: "PUT", path: "/products/bulk-update", handlers: [ensureAuthenticated, bulkUpdateValidation, bulkUpdateProducts] },
  { method: "GET", path: "/products/:id", handlers: [ensureAuthenticated, idValidation, getSingleProduct] },
  { method: "PUT", path: "/products/:id", handlers: [ensureAuthenticated, idValidation, updateProductValidation, updateProduct] },
  { method: "DELETE", path: "/products/:id", handlers: [ensureAuthenticated, idValidation, deleteProduct] },

  { method: "POST", path: "/khata", handlers: [ensureAuthenticated, createKhataValidation, createKhata] },
  { method: "GET", path: "/khata", handlers: [ensureAuthenticated, getAllKhatas] },
  { method: "GET", path: "/khata/phone/:phone", handlers: [ensureAuthenticated, getKhataByPhone] },
  { method: "GET", path: "/khata/:id", handlers: [ensureAuthenticated, idValidation, getKhataById] },
  { method: "PUT", path: "/khata/:id", handlers: [ensureAuthenticated, idValidation, updateKhataValidation, updateKhata] },
  { method: "DELETE", path: "/khata/:id", handlers: [ensureAuthenticated, idValidation, deleteKhata] },
  { method: "GET", path: "/khata/:id/transactions", handlers: [ensureAuthenticated, idValidation, getTransactionsByKhata] },
  { method: "PUT", path: "/khata/:id/transaction", handlers: [ensureAuthenticated, idValidation, addTransaction] },

  { method: "POST", path: "/invoices", handlers: [ensureAuthenticated, invoiceValidation, createInvoice] },
  { method: "GET", path: "/invoices/all", handlers: [ensureAuthenticated, getAllInvoices] },
  { method: "GET", path: "/invoices", handlers: [ensureAuthenticated, getInvoicesByDate] },
  { method: "GET", path: "/invoices/:id", handlers: [ensureAuthenticated, getInvoiceById] },

  {
    method: "GET",
    path: "/settings",
    handlers: [
      async (_req, res) => {
        try {
          let settings = await Settings.findOne();

          if (!settings) {
            settings = await Settings.create({
              companyName: "Your Company Name",
              companyEmail: "info@company.com",
              companyPhone: "+92 XXX XXXXXXX",
              companyAddress: "123 Business Street, City, Country",
              taxRate: 0,
              currency: "Rs",
              invoiceFooter: "Thank you for your business!",
            });
          }

          return res.json({ success: true, data: settings });
        } catch (error) {
          return res.status(500).json({ success: false, message: error.message });
        }
      },
    ],
  },
  {
    method: "PUT",
    path: "/settings",
    handlers: [
      async (req, res) => {
        try {
          const settings = await Settings.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true,
          });

          return res.json({
            success: true,
            data: settings,
            message: "Settings updated successfully",
          });
        } catch (error) {
          return res.status(500).json({ success: false, message: error.message });
        }
      },
    ],
  },

  { method: "POST", path: "/contact", handlers: [contactHandler] },
];

const runHandlers = async ({ handlers, req, res, routePath }) => {
  for (let i = 0; i < handlers.length; i += 1) {
    const handler = handlers[i];
    if (typeof handler !== "function") {
      return res.status(500).json({
        success: false,
        message: `Route handler at index ${i} for path ${routePath} is not a function`,
      });
    }

    let nextCalled = false;

    await Promise.resolve(
      handler(req, res, () => {
        nextCalled = true;
      })
    );

    if (res.response) {
      return res.response;
    }

    if (!nextCalled && i < handlers.length - 1) {
      return res.status(500).json({ success: false, message: "Middleware flow interrupted" });
    }
  }

  return res.response || res.status(204).send("");
};

const createExpressLikeReqRes = async (request, params) => {
  const url = new URL(request.url);
  let parsedBody = {};

  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      parsedBody = await request.json().catch(() => ({}));
    }
  }

  const req = {
    method: request.method,
    originalUrl: url.pathname + url.search,
    path: url.pathname,
    params,
    query: Object.fromEntries(url.searchParams.entries()),
    body: parsedBody,
    headers: Object.fromEntries(request.headers.entries()),
    ip:
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "0.0.0.0",
  };

  const res = {
    statusCode: 200,
    response: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.response = Response.json(payload, { status: this.statusCode });
      return this.response;
    },
    send(payload) {
      this.response = new Response(payload, {
        status: this.statusCode,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
      return this.response;
    },
  };

  return { req, res };
};

export default {
  async fetch(request, env) {
    Object.entries(env || {}).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        process.env[key] = value;
      }
    });

    const origin = request.headers.get("origin");
    const allowedOrigins = parseAllowedOrigins(env?.CORS_ORIGINS || process.env.CORS_ORIGINS || "");

    if (request.method === "OPTIONS") {
      return applyCorsHeaders(new Response(null, { status: 204 }), origin, allowedOrigins);
    }

    await connectDB();

    const url = new URL(request.url);
    const route = routes.find(
      (candidate) =>
        candidate.method === request.method && matchRoute(candidate.path, url.pathname) !== null
    );

    if (!route) {
      return applyCorsHeaders(
        Response.json({ success: false, message: "Route not found" }, { status: 404 }),
        origin,
        allowedOrigins
      );
    }

    const params = matchRoute(route.path, url.pathname) || {};
    const { req, res } = await createExpressLikeReqRes(request, params);
    const response = await runHandlers({ handlers: route.handlers, req, res, routePath: route.path });

    return applyCorsHeaders(response, origin, allowedOrigins);
  },
};
