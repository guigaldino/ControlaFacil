const email = require("./utils/email");
const mlServices = require("./features/integracoes/mercadoLivreServices");
const mlPedidos = require("./features/pedidos/pedidoService");


function getRequiredAttributes() {
  const requireds = x.filter((attribute) => attribute.tags.required === true);
  console.log(requireds);
}

// email.enviarEmailVerificacao().then(() => {
//     console.log("Email enviado com sucesso!")
// });

async function testeSugestaoCategoria() {
  const response = await mlServices.getSugestaoCategorias(
    19,
    "Sapato Nike Revolution 6 Masculino",
  );
  console.log(response);
}

async function testeAtributosCategorias() {
  const response = await mlServices.getAtributosCategorias(19, "MLB107564");
  console.log(response);
}

async function testeWebhook() {
  const payload = {
    _id: "2835febf-83e0-4e23-a296-d0feab696323",
    topic: "orders_v2",
    resource: "/orders/2000016797265420",
    user_id: 3430803000,
    application_id: 6456467593802500,
    sent: "2026-06-05T22:56:36.511Z",
    attempts: 2,
    received: "2026-06-05T22:52:22.018Z",
    actions: [
      "pack_order:false",
      "site_id:mlb",
      "channel:marketplace",
      "payments",
      "is_test:true",
      "expiration_date",
      "order_items",
    ],
  };

  await mlPedidos.processarWebhookPedido(payload);
}

//getRequiredAttributes();

// testeAtributosCategorias();

testeWebhook();
