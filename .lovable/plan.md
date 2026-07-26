## Diagnóstico

O projeto só tem `.env.example` — não existe `.env` real. O Vite só injeta `import.meta.env.VITE_API_URL` quando a variável está em um arquivo `.env` (ou equivalente) na raiz, ou exportada no shell antes do `vite dev`. Como está ausente, `BASE_URL` em `src/services/api.ts` fica `undefined` e o cliente HTTP lança "API não configurada".

Além disso, mesmo criando o `.env`, a API está em `http://192.168.151.46:5000` (HTTP, IP privado). A preview roda em HTTPS na Lovable, então o navegador vai bloquear como **mixed content** e a rede local só é alcançável a partir da sua máquina — não do servidor de preview da Lovable. Precisa ser testado abrindo a preview no mesmo notebook/rede.

## Plano

1. **Criar `.env` na raiz** com:
   ```
   VITE_API_URL=http://192.168.151.46:5000
   ```
2. **Reiniciar o dev server** para o Vite reler variáveis (mudanças em `.env` não entram por HMR).
3. **Validar** no navegador que `import.meta.env.VITE_API_URL` está definido e que uma chamada (ex.: `POST /login`) sai para o IP correto. Se aparecer erro de **mixed content** ou CORS:
   - Rodar a preview local (mesma rede da API), ou
   - Servir a API em HTTPS, ou
   - Habilitar CORS no backend Python para o domínio da preview.

Nenhuma mudança de código de UI/negócio — apenas ambiente.