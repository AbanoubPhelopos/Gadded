import { t } from '../../state/locale'
import { Modal, Note, SourceLink } from '../ui'
import { human } from '../../lib/format'
import type { AssessmentResponse } from '../../data/types'

export default function Sources({data, onClose}: {data: AssessmentResponse; onClose: () => void}) {
  return <Modal title={t("Sources & assumptions")} onClose={onClose} wide><div className="sources-body"><p className="original-evidence">{t('Original-language evidence (English).')}</p><Note>{t("Assumption set ")}{data.assumptions.assumptionSet.id} {t(" · version ")}{data.assumptions.assumptionSet.version} {t(" · effective ")}{data.assumptions.assumptionSet.effectiveDate}{t(". Market ranges and proxies require independent verification.")}</Note>
    <h3>{t("Model & calculation versions")}</h3><dl className="detail-list">{Object.entries(data.result.versions).map(([key, value]) => <div key={key}><dt>{human(key)}</dt><dd><code>{value}</code></dd></div>)}</dl>
    <h3>{t("Assumptions register")}</h3><div className="table-scroll"><table><thead><tr><th>{t("Assumption")}</th><th>{t("Value")}</th><th>{t("Classification & source")}</th></tr></thead><tbody>{Object.entries(data.assumptions.values).map(([key, value]) => <tr key={key}><td><strong>{human(key)}</strong>{value.notes && <small>{value.notes}</small>}</td><td className="tabular-nums">{value.value} {value.unit}</td><td><span className="classification">{value.classification}</span><p><SourceLink url={value.source}>{value.source || t("No source recorded")}</SourceLink></p></td></tr>)}</tbody></table></div>
    <h3>{t("Limitations & run warnings")}</h3><ul className="warning-list">{data.result.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>
  </div></Modal>
}
