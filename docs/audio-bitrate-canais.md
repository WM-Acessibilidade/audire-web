# Bitrate e canais

As caixas de publicação geral, preferência por roteiro e editor oferecem mono e estéreo para cada bitrate disponível: MP3 48/64/96 e Opus 32/48/64/96/128 kbps. Exemplo: “64 kbps — mono” e “64 kbps — estéreo”. Os rótulos completos ficam em opções nativas de select, acessíveis pelo teclado e leitor de telas.

A escolha controla a conversão final no download e no salvamento, incluindo a síntese e a mixagem. A prévia WAV mantém os canais de origem durante a edição para não descartar o estéreo antecipadamente. Mono combina os dois canais; estéreo em uma fonte mono cria dois canais iguais e não recupera informação espacial inexistente. O bitrate indica a taxa total do arquivo.

As configurações anteriores continuam válidas. A opção “conforme original” aparece somente para uma seleção legada ainda sem escolha explícita de canais. O Opus 128 antigo continua estéreo. Escolher qualquer opção mono/estéreo substitui a seleção legada; trocar de formato sugere mono. Nenhum arquivo salvo é convertido automaticamente.

No painel geral, use “Salvar formato de publicação” para guardar o padrão. No roteiro, selecione a preferência personalizada e salve-a. No editor, a escolha vale para o download/salvamento daquela prévia; não altera automaticamente a preferência permanente.

Requer servidor com suporte a `x-audire-audio-canais: 1|2|auto` e migração `20261123_audire_audio_publicacao_canais.sql` antes da publicação desta interface.

Validação: encodes reais e ffprobe para todos os bitrates/canais em ambos os conversores, rotas de publicação/conversão com escolhas explícitas e herdadas, caixas nativas em DOM simulado, integração do editor, título/créditos/lema e regressão de síntese. Navegação manual com leitor de telas não realizada neste ambiente.
