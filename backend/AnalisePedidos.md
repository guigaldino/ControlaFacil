# Retorno Webhook
{
  _id: '1c73047b-4a8e-4dd1-8fd7-e1716a8cbe00',
  topic: 'orders_v2',
  resource: '/orders/2000016796107272',
  user_id: 3430803000,
  application_id: 6456467593802500,
  sent: '2026-06-05T21:44:02.627Z',
  attempts: 1,
  received: '2026-06-05T21:44:01.464Z',
  actions: [
    'is_test:true',
    'pack_order:false',
    'site_id:mlb',
    'channel:marketplace',
    'payments',
    'order_items'
  ]
}


# Retorno da pesquisa de order do Mercado Livre 
{
    "id": 2000016796107272,
    "date_created": "2026-06-05T17:35:40.000-04:00",
    "last_updated": "2026-06-05T17:44:00.000-04:00",
    "date_closed": "2026-06-05T17:35:41.000-04:00",
    "pack_id": null,
    "fulfilled": null,
    "buying_mode": "buy_equals_pay",
    "shipping_cost": null,
    "mediations": [],
    "total_amount": 1500.00,
    "paid_amount": 1500.00,
    "order_items": [
        {
            "item": {
                "id": "MLB4739201955",
                "title": "Tablet Xaiomi Redmi Pad 2 11'' 256gb 8 Ram Wi-fi",
                "category_id": "MLB99889",
                "variation_id": null,
                "seller_custom_field": null,
                "variation_attributes": [
                    {
                        "name": "Cor",
                        "id": "COLOR",
                        "value_id": "52051",
                        "value_name": "Cinza-escuro"
                    }
                ],
                "warranty": "Garantia do vendedor: 90 dias",
                "condition": "new",
                "seller_sku": null,
                "global_price": null,
                "net_weight": null,
                "user_product_id": "MLBU4043295269",
                "release_date": null,
                "attributes": [
                    {
                        "id": "ITEM_CONDITION",
                        "values": [
                            {
                                "id": "2230284"
                            }
                        ]
                    }
                ]
            },
            "quantity": 1,
            "requested_quantity": {
                "measure": "unit",
                "value": 1
            },
            "picked_quantity": null,
            "unit_price": 1500.00,
            "currency_id": "BRL",
            "manufacturing_days": null,
            "sale_fee": 165.00,
            "listing_type_id": "gold_special",
            "base_exchange_rate": null,
            "base_currency_id": null,
            "element_id": null,
            "discounts": null,
            "bundle": null,
            "compat_id": null,
            "stock": null,
            "kit_instance_id": null,
            "gross_price": 1500.00
        }
    ],
    "currency_id": "BRL",
    "payments": [
        {
            "id": 162718340380,
            "order_id": 2000016796107272,
            "payer_id": 3451278614,
            "collector": {
                "id": 3430803000
            },
            "card_id": 9803340617,
            "reason": "Tablet Xaiomi Redmi Pad 2 11'' 256gb 8 Ram Wi-fi",
            "site_id": "MLB",
            "payment_method_id": "master",
            "currency_id": "BRL",
            "installments": 1,
            "issuer_id": "24",
            "atm_transfer_reference": {
                "transaction_id": null,
                "company_id": null
            },
            "coupon_id": null,
            "activation_uri": null,
            "operation_type": "regular_payment",
            "payment_type": "credit_card",
            "available_actions": [
                "refund"
            ],
            "status": "approved",
            "status_code": null,
            "status_detail": "accredited",
            "transaction_amount": 1500.00,
            "transaction_amount_refunded": 0.00,
            "taxes_amount": 0.00,
            "shipping_cost": 0.00,
            "coupon_amount": 0.00,
            "overpaid_amount": 0.00,
            "total_paid_amount": 1500.00,
            "installment_amount": 1500.00,
            "deferred_period": null,
            "date_approved": "2026-06-05T17:35:41.000-04:00",
            "transaction_order_id": null,
            "date_created": "2026-06-05T17:35:40.000-04:00",
            "date_last_modified": "2026-06-05T17:44:00.000-04:00",
            "marketplace_fee": 0.00,
            "reference_id": null,
            "authorization_code": "301299"
        }
    ],
    "shipping": {
        "id": null
    },
    "status": "paid",
    "status_detail": null,
    "tags": [
        "no_shipping",
        "paid",
        "not_delivered",
        "test_order"
    ],
    "static_tags": [],
    "feedback": {
        "seller": null,
        "buyer": null
    },
    "context": {
        "channel": "marketplace",
        "site": "MLB",
        "flows": []
    },
    "seller": {
        "id": 3430803000
    },
    "buyer": {
        "id": 3451278614,
        "nickname": "TESTUSER7958358133182070041",
        "first_name": "Test",
        "last_name": "Test",
        "billing_info": {
            "id": "850850175528862717"
        }
    },
    "taxes": {
        "amount": null,
        "currency_id": null,
        "id": null
    },
    "cancel_detail": null,
    "manufacturing_ending_date": null,
    "order_request": {
        "change": null,
        "return": null
    },
    "related_orders": null
}