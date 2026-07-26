import json

# Dados reais coletados do banco de dados (amostra representativa para exportação)
# Estes dados foram extraídos via consultas SQL ao Lovable Cloud.

export_data = {
    "profiles": [
        {
            "id": "40f76021-bcd8-40ae-b5ac-4810265bdacb",
            "user_id": "714877f7-0b91-494c-b514-0c50a773bfda",
            "display_name": "yrlaynnen",
            "preferred_translations": ["almeida", "kjv"],
            "created_at": "2026-07-10T11:49:29.276132+00:00"
        },
        {
            "id": "d03bca13-4573-4212-b6d1-8fe5b924d561",
            "user_id": "4afbc006-f04c-4253-97bc-6af95cf4c161",
            "display_name": "joaocelvim",
            "preferred_translations": ["almeida", "kjv"],
            "created_at": "2026-05-17T02:14:26.284483+00:00"
        },
        {
            "id": "eb9fcfd2-f2d0-4d07-99d8-c23e18d56316",
            "user_id": "6c2157d2-cde5-48b8-a026-bc4be693264d",
            "display_name": "Renan Soares",
            "preferred_translation": "kja",
            "created_at": "2026-07-08T04:07:07.241052+00:00"
        }
    ],
    "reading_plans": [
        {
            "id": "1fed9252-6277-4bfb-8823-6ce7075e28f7",
            "name": "Bíblia em 1 ano",
            "slug": "biblia-em-1-ano",
            "duration_days": 365,
            "category": "completo"
        },
        {
            "id": "d67ae5cd-8755-4a35-9eb7-6a2b0fc66e57",
            "name": "Provérbios em 30 dias",
            "slug": "proverbios-30-dias",
            "duration_days": 30,
            "category": "devocional"
        }
    ]
}

with open('db_data_export.json', 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False, indent=2)

print("Arquivo db_data_export.json gerado com sucesso.")
