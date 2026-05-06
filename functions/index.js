const { onRequest } = require("firebase-functions/v2/https");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Verifica un pago de MercadoPago por ID de operación.
 * Token leído desde functions/.env → MP_ACCESS_TOKEN
 */
exports.verificarPagoMP = onRequest(
  { region: "us-central1", invoker: "public" },
  async (req, res) => {
    // CORS preflight
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.set(k, v));
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { operacionId } = req.body ?? {};

    if (!operacionId || !/^\d{8,20}$/.test(String(operacionId).trim())) {
      res.status(400).json({ error: "ID de operación inválido." });
      return;
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      res.status(500).json({ error: "Configuración de pago no disponible." });
      return;
    }

    try {
      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${String(operacionId).trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (mpRes.status === 404) {
        res.status(404).json({ error: "No se encontró ningún pago con ese número de operación." });
        return;
      }
      if (!mpRes.ok) {
        res.status(502).json({ error: "Error al consultar MercadoPago." });
        return;
      }

      const payment = await mpRes.json();

      if (payment.status !== "approved") {
        res.status(422).json({
          error: `El pago no está aprobado (estado: ${payment.status}).`,
        });
        return;
      }

      res.status(200).json({
        valid: true,
        monto: payment.transaction_amount,
        fecha: payment.date_approved,
      });
    } catch {
      res.status(500).json({ error: "Error de conexión con MercadoPago." });
    }
  }
);
