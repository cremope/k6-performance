import http from "k6/http";
import { check, sleep } from "k6";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// Requisito do desafio
// const VUS = parseInt(__ENV.VUS || "500", 10);
// const DURATION = __ENV.DURATION || "5m";

const VUS = parseInt(__ENV.VUS || "5", 10);
const DURATION = __ENV.DURATION || "30s";

// Variacao simples de IDs (1..20)
const IDS = Array.from({ length: 20 }, (_, i) => i + 1);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_failed: ["rate<0.02"],     // taxa de erro < 2%
    http_req_duration: ["p(95)<1500"],  // p95 < 1.5s
  },
};

export default function () {
  const id = pick(IDS);

  const res = http.get(`${BASE_URL}/posts/${id}`, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "k6-performance",
    },
    timeout: "15s",
  });

  check(res, {
    "status 200": (r) => r.status === 200,
    "content-type json": (r) => (r.headers["Content-Type"] || "").includes("application/json"),
    "tem id esperado": (r) => {
      try {
        return r.json()?.id === id;
      } catch {
        return false;
      }
    },
  });

  // Think time curto com jitter (simula usuarios reais e evita padrao robotico)
  sleep(randomIntBetween(1, 3));
}

export function handleSummary(data) {
  const p95 = data.metrics?.http_req_duration?.values?.["p(95)"] ?? null;
  const p99 = data.metrics?.http_req_duration?.values?.["p(99)"] ?? null;
  const failRate = (data.metrics?.http_req_failed?.values?.rate ?? 0) * 100;
  const rps = data.metrics?.http_reqs?.values?.rate ?? null;

  const analysis = [
    "# Analise do teste de carga (k6 - jsonplaceholder)",
    "",
    "## Cenario executado",
    `- Concorrencia: **${VUS} usuarios (VUs)**`,
    `- Duracao: **${DURATION}**`,
    `- Endpoint: **GET ${BASE_URL}/posts/{id}**`,
    "",
    "## Metricas principais",
    `- p95 (http_req_duration): ${p95 !== null ? p95.toFixed(2) + " ms" : "N/D"}`,
    `- p99 (http_req_duration): ${p99 !== null ? p99.toFixed(2) + " ms" : "N/D"}`,
    `- Taxa de erro (http_req_failed): ${failRate.toFixed(2)}%`,
    `- Throughput (http_reqs rate): ${rps !== null ? rps.toFixed(2) + " req/s" : "N/D"}`,
    "",
    "## Gargalos potenciais (interpretacao)",
    "- **Latencia alta (p95/p99)**: pode indicar saturacao do servico, gargalo de rede/DNS ou limite de conexoes concorrentes.",
    "- **Timeouts**: sob picos, respostas podem exceder o timeout (15s), elevando a taxa de falha.",
    "- **Rate limit**: APIs publicas podem aplicar limites e retornar erros intermitentes (ex.: 429) ou reduzir throughput.",
    "- **Variabilidade por horario**: servicos publicos sofrem oscilacao de carga (piora em horarios de pico).",
    "",
    "## Proximos passos (em cenario real)",
    "- Rodar o mesmo teste em ambiente controlado (homolog/mocks internos) para obter metricas estaveis.",
    "- Adicionar estagios (ramp-up) para encontrar o ponto de degradacao.",
    "- Correlacionar com observabilidade (APM/logs) para localizar gargalos (CPU/DB/rede).",
    "",
  ].join("\\n");

  return {
    "results/report.html": htmlReport(data),
    "results/summary.json": JSON.stringify(data, null, 2),
    "results/analysis.md": analysis,
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}