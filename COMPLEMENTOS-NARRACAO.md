# Título, créditos e lema na narração pronta

O novo editor permite escolher título, créditos e lema independentemente, em qualquer uma das sete combinações não vazias. O título precede a narração; créditos e lema a seguem, nessa ordem. Usa a pausa de troca de campos, inclusive zero.

Cada parte selecionada é gerada separadamente por `/tts/preview`, usando uma fotografia do mecanismo, voz, instruções aplicáveis, normalização e configuração de pausas/fragmentação selecionados. A narração original não é enviada para síntese. Título e créditos vazios são validados antes de gerar qualquer parte; o lema vem da configuração do servidor.

As partes geradas são preparadas na taxa de amostragem da narração pelo OfflineAudioContext. A união em WAV float32 preserva integralmente as amostras da narração em edição e os canais esquerdo/direito. Uma parte mono é centralizada quando a narração é estéreo. As preferências de formato, bitrate e canais permanecem com o comportamento atual.

A composição só substitui a prévia depois que todas as gerações terminam. Erros ou uma troca de fonte durante a geração preservam a prévia anterior. A inclusão é uma etapa de desfazer e pode ser restaurada. Para trocar uma inclusão já feita, desfazer antes de gerar novamente. O arquivo do roteiro só muda ao salvar/publicar explicitamente.

O botão legado foi renomeado para “Acrescentar título/créditos/lema”. Se o editor estiver ativo, usa a narração em edição. Caso contrário, importa o WAV selecionado no campo Substituir áudio. Neste caminho legado, as escolhas são as caixas Título, Créditos e Lema da seção de síntese. No novo editor, há três caixas próprias e o botão “Gerar e acrescentar partes à prévia”. AIFF continua disponível pelo carregamento do novo editor.

Verificação executada: sete combinações e pausas zero/não zero; amostras originais e estéreo preservados; configuração e geração apenas dos campos selecionados; validação antes de chamadas; falha sem perder a prévia; desfazer; reuso do WAV selecionado e do editor ativo; sintaxe da página. Interface testada com DOM simulado, sem teste manual com leitor de telas.

Publicação somente no frontend; não requer migração, alterações de backend ou de configurações existentes. Para reverter, restaurar os arquivos deste commit em novo commit. Não alterar áudios ou configurações.
