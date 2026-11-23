# Seleção interna e área de transferência de áudio

A mesma interface é montada no editor da narração carregada e na prévia WAV da síntese. Os cortes externos existentes continuam disponíveis. As edições são locais à página e não publicam nem substituem automaticamente o áudio salvo do roteiro.

- Início, fim e inserção aceitam segundos ou minutos:segundos, ponto ou vírgula decimal. Botões e setas ajustam 0,01 segundo. Cada marcador também aceita a posição do player principal.
- Ouvir seleção inteira está sempre disponível para seleções válidas. Primeiros/últimos cinco segundos só aparecem acima de 15 segundos, estritamente. A reprodução usa um WAV contendo apenas o intervalo escolhido.
- Copiar mantém a origem. Recortar guarda o trecho e une as partes restantes. Excluir une as partes sem substituir a área de transferência. A seleção de todo o áudio pode ser copiada; sua remoção é recusada para não produzir um arquivo vazio.
- A área de transferência é compartilhada entre os dois editores na mesma página, e não persiste após fechar ou recarregar. A normalização usa o ganho comum de pico a -1 dBFS já existente, preservando a relação entre canais.
- Inserir abre espaço. O trecho é adaptado à taxa de amostragem e aos canais do destino: mono é duplicado em destino estéreo; estéreo é reduzido pela média dos canais em destino mono. A duração total aumenta pela duração inserida, com arredondamento à amostra.
- Baixar trecho usa o conversor autenticado já existente e permite MP3 ou Ogg/Opus, com as opções de bitrate e canais válidas de cada formato. Download e inserção mantêm o trecho disponível.
- O botão Desfazer de cada editor recupera as edições da sua origem e o estado da transferência nas operações de recorte/normalização. O histórico é limitado por quantidade e orçamento de memória. O novo núcleo recusa saídas PCM maiores que 64 MB antes da alocação.
- Campos rotulados, botões por teclado e regiões de status anunciam resultados e duração. Não foi feito teste com VoiceOver ou NVDA real nesta alteração.

## Validação

Execute `npm ci --ignore-scripts` e `npm test`. Os testes cobrem operações sobre amostras, limites inválidos, origem preservada, união e inserção exatas, adaptação de canais/taxas, regra dos 15 segundos, cursores, normalização e desfazer, download e os dois adaptadores reais, além dos testes existentes. Os testes de interface usam DOM simulado e reprodução simulada; não substituem a escuta em navegador e a conferência com leitor de tela.
