"""
Script para sincronizar os imóveis com o banco de dados Supabase via API REST.
Uso:
    python sincronizar_supabase.py
    ou
    python sincronizar_supabase.py --url https://SEU-PROJETO.supabase.co --key SUA-CHAVE-ANON
"""

import urllib.request
import json
import sys
import os
import argparse

sys.stdout.reconfigure(encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description="Sincronizar imóveis no Supabase")
    parser.add_argument("--url", help="URL do Supabase (ex: https://xyz.supabase.co)")
    parser.add_argument("--key", help="Chave pública/anon do Supabase")
    parser.add_argument("--novos-apenas", action="store_true", help="Enviar apenas os 15 novos imóveis")
    args = parser.parse_args()

    supabase_url = args.url or os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    supabase_key = args.key or os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY")

    if not supabase_url:
        print("\n=== Sincronização Supabase — Habittat House ===")
        supabase_url = input("Digite a URL do seu Supabase (ex: https://xyz.supabase.co): ").strip()
    
    if not supabase_key:
        supabase_key = input("Digite sua Chave Anon/Service_Role do Supabase: ").strip()

    supabase_url = supabase_url.rstrip('/')

    # Encontrar arquivo all_properties.json
    paths_to_check = [
        os.path.join(os.path.dirname(__file__), 'src', 'data', 'all_properties.json'),
        r'c:\Users\hanri\Desktop\Imobiliaria\src\data\all_properties.json',
        r'c:\Users\hanri\Desktop\ismael-dias-corretor-main\src\data\all_properties.json'
    ]
    json_path = None
    for p in paths_to_check:
        if os.path.exists(p):
            json_path = p
            break

    if not json_path:
        print("ERRO: all_properties.json não encontrado!")
        sys.exit(1)

    with open(json_path, 'r', encoding='utf-8') as f:
        props = json.load(f)

    NEW_15_SKUS = {
        '387023', '390866', '385395', '393023', '384856',
        '383009', '384851', '390779', '390792', '390852',
        '390915', '392363', '392450', '392513', '393386'
    }

    if args.novos_apenas:
        props = [p for p in props if str(p.get('sku')) in NEW_15_SKUS]
        print(f"Filtrado para os 15 novos imóveis.")

    print(f"Preparando {len(props)} imóveis para envio ao Supabase...")

    rows = []
    for p in props:
        rows.append({
            'sku': str(p.get('sku', '')),
            'name': p.get('name', ''),
            'price': int(p.get('price', 0)),
            'cat': p.get('cat', 'Casas'),
            'badge': p.get('badge', 'Disponível'),
            'bairro': p.get('bairro', 'Teresópolis'),
            'img': p.get('img', ''),
            'images': p.get('images', []),
            'specs': p.get('specs', ''),
            'storage': p.get('storage', ''),
            'condition': p.get('condition', p.get('badge', 'Disponível')),
            'warranty': p.get('warranty', ''),
            'battery': p.get('battery', ''),
            'screen': p.get('screen', ''),
            'camera': p.get('camera', ''),
            'chip': p.get('chip', ''),
            'box_items': p.get('boxItems', []),
            'description': p.get('description', ''),
            'url': p.get('url', ''),
            'is_active': True
        })

    batch_size = 20
    total_synced = 0
    endpoint = f"{supabase_url}/rest/v1/properties?on_conflict=sku"

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        req_body = json.dumps(batch).encode('utf-8')
        req = urllib.request.Request(endpoint, data=req_body, headers={
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        })
        
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                total_synced += len(batch)
                print(f"  ✓ [{total_synced}/{len(rows)}] Lote {i // batch_size + 1} sincronizado!")
        except urllib.error.HTTPError as e:
            print(f"  ✗ ERRO no lote {i // batch_size + 1}: HTTP {e.code} - {e.read().decode('utf-8')}")
            sys.exit(1)
        except Exception as e:
            print(f"  ✗ ERRO de conexão: {e}")
            sys.exit(1)

    print(f"\n🎉 SUCESSO! {total_synced} imóveis foram sincronizados com o Supabase com sucesso!")

if __name__ == '__main__':
    main()
