import type { RelatorioEstrategia } from './estrategia-relatorio'
import { CORRESPONDENCIA_ODS, PACTO_GLOBAL } from './onu'

const esc = (v: unknown) =>
String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const brl = (v: number) =>
'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' bi'

type Reg = Record<string, unknown>
const campo = (item: unknown, chave: string): string => {
const v = (item as Reg)[chave]
return v === undefined || v === null ? '—' : String(v)
}

function tabela(cabecalhos: string[], linhas: string[][]): string {
if (!linhas.length) return '<p class="vazio">Sem dados disponíveis.</p>'
return (
    '<table><thead><tr>' + cabecalhos.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
    linhas.map((l) => '<tr>' + l.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table>'
)
}

export function renderRelatorioHtml(r: RelatorioEstrategia): string {
const t = r.financeiro.trimestre

const financeiro = tabela(
    ['Indicador', 'Valor'],
    [
    ['PIB Agro', brl(t.pibBrlBi)],
    ['Tributos', brl(t.tributosBrlBi)],
    ['Frete', brl(t.freteBrlBi)],
    ['Custo Brasil', brl(t.custoBrlBi)],
    ['Resultado', brl(t.resultadoBrlBi)],
    ['Margem', t.margemPct.toFixed(1) + '%'],
    ],
)

const serie = tabela(
    ['Trimestre', 'PIB', 'Tributos', 'Frete', 'Resultado', 'Margem'],
    r.financeiro.serie.map((s) => [
    s.rotulo, brl(s.pibBrlBi), brl(s.tributosBrlBi),
    brl(s.freteBrlBi), brl(s.resultadoBrlBi), s.margemPct.toFixed(1) + '%',
    ]),
)

const graos = tabela(
    ['Cultura', 'Estoque (meses)', 'Status'],
    r.graos.indicadores.map((i) => [
    campo(i, 'cultura'),
    campo(i, 'estoqueMeses'),
    campo(i, 'status'),
    ]),
)

const alocacao = tabela(
    ['Recurso', '%'],
    r.alocacao.itens.map((a) => [campo(a, 'resourceLabel'), campo(a, 'allocationPct')]),
)

const ods = tabela(
    ['Indicador', 'ODS', 'Justificativa'],
    CORRESPONDENCIA_ODS.map((o) => [o.indicador, o.ods, o.justificativa]),
)

const pacto = tabela(
    ['Área', 'Princípios'],
    PACTO_GLOBAL.map((p) => [p.area, p.principios]),
)

return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Relatório Estratégico — ${esc(r.referencia)}</title>
<style>
@page { size: A4; margin: 20mm 18mm }
body { font: 11pt/1.55 Georgia, serif; color: #14181f; margin: 0 }
h1 { font-size: 20pt; margin: 0 0 4mm }
h2 { font-size: 13pt; margin: 9mm 0 3mm; border-bottom: 1px solid #c9ced6; padding-bottom: 1.5mm }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 3mm 0 }
th, td { border: 1px solid #d8dde5; padding: 1.8mm 2mm; text-align: left }
th { background: #f2f4f7 }
.meta { font-size: 9pt; color: #5b6472; margin-bottom: 8mm }
.nota { font-size: 9pt; background: #f7f8fa; border-left: 3px solid #0aa06e; padding: 3mm 4mm; margin: 4mm 0 }
.vazio { font-size: 9.5pt; color: #5b6472; font-style: italic }
ul { margin: 2mm 0; padding-left: 5mm }
footer { margin-top: 12mm; font-size: 8.5pt; color: #5b6472 }
</style></head><body>

<h1>Relatório Estratégico</h1>
<p class="meta">Referência: ${esc(r.referencia)} · Gerado em ${esc(new Date(r.geradoEm).toLocaleString('pt-BR'))} · Versão ${esc(r.versao)}</p>

<h2>1. Sumário executivo</h2>
<ul>${r.resumoExecutivo.map((l) => '<li>' + esc(l) + '</li>').join('')}</ul>

<h2>2. Desempenho econômico — ${esc(t.rotulo)}</h2>
${financeiro}
<p class="nota">Resultado = PIB − tributos − frete. Não corresponde a lucro contábil: o valor adicionado já exclui insumos intermediários.</p>

<h2>3. Série histórica</h2>
${serie}

<h2>4. Metodologia e parâmetros</h2>
${tabela(
['Parâmetro', 'Valor'],
[
    ['Alíquota tributária', (r.custoBrasil.aliquotaTributaria * 100).toFixed(2) + '%'],
    ['Frete médio', 'R$ ' + r.custoBrasil.freteTonMedio + '/t'],
    ['Produção de grãos (anual)', r.custoBrasil.producaoGraosAnual + ' Mt'],
    ['Toneladas no trimestre', r.custoBrasil.toneladasNoTrimestre + ' Mt'],
],
)}

<h2>5. Balanço de grãos — safra ${esc(r.graos.safra)}</h2>
<p class="meta">População de referência: ${esc((r.graos.populacao / 1_000_000).toFixed(0))} milhões de habitantes.</p>
${graos}

<h2>6. Alocação de recursos</h2>
${alocacao}
<p>Eficiência de alocação: <strong>${esc(r.alocacao.eficiencia)}%</strong>.</p>

<h2>7. Recomendações</h2>
<ul>${r.insights.map((i) => '<li>' + esc(campo(i, 'titulo') || campo(i, 'texto') || campo(i, 'descricao')) + '</li>').join('')}</ul>

<h2>8. Correspondência com os ODS</h2>
${ods}

<h2>9. Princípios do Pacto Global</h2>
${pacto}

<h2>10. Limitações e metodologia</h2>
<ul>
<li>Dados de origem simulada nesta versão.</li>
<li>Indicadores calculados sobre a base ${esc(r.referencia)}; não substituem demonstrações contábeis auditadas.</li>
<li>Correspondência ODS em nível de indicador, não de meta auditada.</li>
</ul>

<footer>Documento alinhado às diretrizes de relato do Pacto Global da ONU, aos Objetivos de Desenvolvimento Sustentável e à estrutura GRI. Alinhamento não implica certificação ou auditoria externa.</footer>
</body></html>`
}