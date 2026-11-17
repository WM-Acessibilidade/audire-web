# Reversão da atualização de prévias — 17/11/2026

Versões preservadas antes da implementação:

- Frontend `WM-Acessibilidade/audire-web`: branch `backup/estavel-2026-11-17-antes-previas`, commit `a0bc015d4e35a85995256cbf0e82c29353b607be`, tree `63e3bba0a39eed52676d6cf8a5843e9c071c1f7e`.
- Servidor `WM-Acessibilidade/audesc-events-api`: branch de mesmo nome, commit `2ee0d613bc75f07956908b2b1dd2a01436884ad8`, tree `1fccf75a006c0835735ca80eeed992c0aa1e0be8`.

Para reverter esta atualização, restaurar os arquivos alterados a partir dessas versões em um novo commit e publicar normalmente. Não usar force-push e não descartar alterações posteriores sem revisão. Se ainda não houver alterações posteriores, um novo commit com a árvore estável restaura integralmente a versão anterior.

Reverter primeiro o frontend e depois o servidor. Confirmar o GitHub Pages e `/health` do servidor após as publicações. Os links de prévia deixarão de funcionar com o servidor anterior.

As tabelas novas `audire_previas` e `audire_revisoes_compartilhadas` e a função `audire_salvar_revisao_compartilhada` são aditivas. Devem ser mantidas na reversão, com RLS e sem concessões para anon/authenticated, para preservar revisões eventualmente recebidas. A versão antiga do aplicativo não as utiliza. Não apagar tabelas de roteiros, repositórios ou configurações.

Não foi alterada a configuração de autenticação/SMTP do Supabase. O código existente de envio do Audesc e `RESEND_FROM_EMAIL` permanecem intactos.

## Configuração exclusiva do e-mail do Audire

O remetente do novo fluxo é `Audire <contato@audire.pro>`. Ativar `AUDIRE_PREVIAS_EMAIL_HABILITADO=true` somente depois de verificar `audire.pro` no Resend e confirmar que a chave pode enviar por esse domínio. Se necessário, usar `AUDIRE_RESEND_API_KEY` dedicado, sem trocar `RESEND_API_KEY` nem `RESEND_FROM_EMAIL` do Audesc.

Para desativar apenas o envio de convites, definir `AUDIRE_PREVIAS_EMAIL_HABILITADO=false` e publicar a configuração. A cópia do link e a revisão continuam funcionando.

Os links usam assinatura HMAC com finalidade exclusiva, usando `AUDIRE_PREVIA_SECRET` ou, na ausência, o `ADMIN_TOKEN` existente. Alterar esse segredo invalida assinaturas antigas. Nenhum segredo é armazenado neste documento ou no frontend. Links e textos de revisão não devem ser registrados em logs.

O token fica no fragmento do URL e é enviado ao servidor apenas por cabeçalho. As respostas de prévia são no-store/noindex. A revisão não modifica o roteiro original e não publica nem refaz áudio.
