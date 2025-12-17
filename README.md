# k6-performance

Projeto de **Testes Automatizados de Performance** utilizando **k6**, executando via GitHub Actions e relatório do GitHub Pages. Testamos a Api https://jsonplaceholder.typicode.com/


## Dependências
- K6: 0.49+ (recomendado usar sempre a versão mais atual)


## Instalação (Windows)
- **k6** :
  - Opção 1 Chocolatey: Abrir powershell e digitar `choco install k6 -y` 
  - Opção 2:  Baixar binário do k6 e adicionar no PATH
- (Opcional) **Chrome** para abrir `results/report.html`

Verifique:
```bash
k6 version
```

## Rodar localmente (Windows)

### Execução rápida (debug)
```bash
k6 run -e VUS=5 -e DURATION=30s src/tests/jsonplaceholder-load.test.js
```
Obs: aqui podemos "brincar" com os valores das VU's e/ou Duration

### Execução oficial do desafio (500 VUs / 5 min)
```bash
k6 run src/tests/jsonplaceholder-load.test.js
```

### Abrir relatório
Abra no Chrome:
- `results/report.html`


## Rodando CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

### Quando roda
- Em todo `push`
- Em todo `pull_request`
- Manualmente (`workflow_dispatch`)

### O que faz
1. Checkout do repo
2. Instala k6
3. Executa o teste (500 VUs / 5 min)
4. Publica artifacts com relatório/summary/análise

Baixe o resultado em: **Actions → run → Artifacts → k6-results**

## ScreenShots
<img src="https://github.com/cremope/k6-performance/blob/main/ScreenShots/evidencia_ok_html_k6_1.png" width="400" /> 
<img src="https://github.com/cremope/k6-performance/blob/main/ScreenShots/evidencia_ok_html_k6_2.png" width="400" /> 
<img src="https://github.com/cremope/k6-performance/blob/main/ScreenShots/evidencia_ok_html_k6_3.png" width="400" /> 