## Plano

1. **Confirmar a configuração real**
   - Verificar o conteúdo exato do `.env` na raiz e garantir que esteja assim, sem aspas e sem barra final:

   ```text
   VITE_API_URL=https://aimetch-talent.onrender.com
   ```

2. **Garantir que o Vite carregue a variável**
   - Reiniciar o servidor de desenvolvimento, porque variáveis `VITE_*` só são injetadas no frontend quando o Vite inicia.
   - Depois forçar atualização da preview para descartar bundle antigo.

3. **Validar no app**
   - Abrir a tela de login novamente e confirmar que o erro “API não configurada” desapareceu.
   - Se aparecer outro erro, tratar como erro de conexão/CORS/autenticação da API, não mais como variável ausente.

4. **Manter segurança do `.env`**
   - Confirmar que `.env` continua coberto pelo `.gitignore` para não ser versionado.