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


## Prévias de repositórios — 17/11/2026

Versões preservadas antes desta extensão:

- Frontend `WM-Acessibilidade/audire-web`: branch `backup/estavel-2026-11-17-antes-previas-repositorios`, commit `f6d007b9e099f47110c6b30e3996369ffb3674e8`.
- Backend `WM-Acessibilidade/audesc-events-api`: mesma branch de backup, commit `a9e820f4d63d49256c781c743d88830c190260d6`.

Para reverter apenas esta extensão, restaurar em novos commits os arquivos alterados a partir desses commits; revisar mudanças posteriores antes de restaurar. Reverter primeiro o frontend e depois o backend. Nunca usar force-push.

As novas tabelas `audire_previas_repositorios` e `audire_revisoes_repositorios` e a função `audire_salvar_revisao_repositorio` são aditivas e devem permanecer na reversão, com RLS e acesso restrito a `service_role`, para preservar as revisões recebidas. A versão anterior não as utiliza.

Não alterar `AUDIRE_PREVIAS_EMAIL_HABILITADO`, as chaves do Resend, os remetentes ou a autenticação/SMTP do Supabase ao reverter esta extensão. Os convites individuais de roteiro continuam funcionando.

O token do repositório usa a finalidade HMAC exclusiva `audire-previa-repositorio-v1`, no fragmento `#previarepo=` e no cabeçalho `x-audire-previa`. Ele autoriza somente a leitura desse repositório e de seus roteiros atualmente vinculados (inclusive rascunhos/ocultos). A permissão opcional de revisão permite salvar apenas `descricao`, em registro separado; nunca grava o original nem o texto de roteiros. Validade e revogação são verificadas em cada consulta, navegação e gravação. Links de roteiro e de repositório não são intercambiáveis.

Validação: testes de autorização/escopo, revisão isolada, limite de 12.000 caracteres, conflitos de versão, expiração, revogação e envio simulado; testes das telas e regressão das prévias individuais. O teste SQL transacional verifica a função real e as restrições de acesso, revertendo todos os registros de teste.

## Revisão dos roteiros pelo link do repositório — 20/11/2026

A permissão `permitir_revisao_roteiros` é independente de `permitir_revisao` (apresentação). Seu padrão é `false`, inclusive para links existentes. URLs, IDs, finalidade HMAC, segredo, validade e revogação continuam iguais. Revisões individuais existentes permanecem independentes.

As novas revisões são isoladas por `(previa_id, roteiro_id)`, em `audire_revisoes_roteiros_repositorios`. O servidor e a função SQL verificam a vinculação atual do roteiro ao repositório. A função bloqueia alterações concorrentes de permissão e de vinculação durante a gravação. O revisor só salva texto; o original é aplicado manualmente no administrador do roteiro, pelo painel “Revisões recebidas pelo repositório”.

Publicar nesta ordem: aplicar `audire-previas-repositorios-roteiros.sql` no banco do servidor; executar o teste SQL transacional correspondente; publicar o servidor; confirmar a nova rota; publicar o frontend. Não publicar o frontend antes do servidor. Os testes Node cobrem interface, API e compatibilidade dos links; não substituem o teste SQL real.

Reversão: restaurar o frontend anterior e depois o servidor anterior em novos commits. Manter a coluna, a tabela e a função novas com RLS e grants restritos ao `service_role`, para preservar revisões recebidas. Não trocar segredos ou apagar links. Os dados adicionais são compatíveis com o código anterior.
